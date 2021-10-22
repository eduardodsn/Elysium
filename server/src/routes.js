const routes = require("express").Router();
const multer = require("multer");
const config = require("./config/multer");
const sha1 = require("sha1");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdfUtil = require("pdf-to-text");
const translate = require("translate");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

let db = require("./db");


routes.post("/api/user/create", (req, res) => {
	if (!req.body.name) {
		res.status(500).send("[ERROR] Empty body!");
	} else {
		let name = req.body.name;
		let email = req.body.email;
		let password = sha1(req.body.password);
		let state = req.body.state;
		let city = req.body.city;
		let profilePhoto = req.body.profilePhoto;
		let id_school = req.body.id_school;
		let xp = 0;
		let id_emblema = 1;
		let tp_usuario = req.body.tp_user;

		let image = Buffer.from(profilePhoto, "base64");

		let query =
			"INSERT INTO usuarios (nome, email, senha, uf, cidade, imagem, xp, id_escola, id_emblema, tp_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(
			query,
			[
				name,
				email,
				password,
				state,
				city,
				image,
				xp,
				id_school,
				id_emblema,
				tp_usuario,
			],
			function (error, results, fields) {
				if (error) {
					if (String(error.sqlMessage).includes("Duplicate entry")) {
						res.send({ status: "[ERROR - EMAIL]" });
					} else {
						res.status(500).send("[ERROR] Accessing DB");
					}
					console.log(error);
				} else {
					res.send({ status: "[OK]" });
				}
			}
		);
	}
});

routes.post("/api/user/login", (req, res) => {
	if (!req.body.email) {
		res.send("[ERROR] Empty body!");
	} else {
		let email = req.body.email;
		let senha = sha1(req.body.password);
		let query = "SELECT id, email, senha FROM usuarios WHERE email = ?";

		db.query(query, email, function (error, results, fields) {
			if (error) {
				res.send("[ERROR]");
				console.log(error);
			} else if (results[0] !== undefined) {
				if (results[0].senha == senha) {
					db.query("UPDATE usuarios SET token = ? WHERE email = ?", [
						req.body.token,
						req.body.email,
					]);
					res.send("[OK]");
				} else {
					res.send("[PASSWORD INCORRECT]");
				}
			} else {
				res.send("[NO USER]");
			}
		});
	}
});

routes.post("/api/user/delete", (req, res) => {
	if (!req.body.email || req.body.email === undefined) {
		res.send("[ERROR] Empty body!");
	} else {
		let query = "DELETE FROM usuarios WHERE email = ?";

		db.query(query, req.body.email, function (error, results, fields) {
			if (error) {
				res.send("[ERROR]");
				console.log(error);
			} else {
				res.send("[OK]");
			}
		});
	}
});

routes.post("/api/user/data", (req, res) => {
	if (!req.body.token) {
		res.send("[ERROR] Empty body!");
	} else {

		let ranking;
		let livros;
		db.query(
			'SELECT COUNT(*) AS "ranking" FROM usuarios WHERE xp >= (SELECT xp FROM usuarios WHERE token = ?)',
			req.body.token,
			function (error, results, fields) {
				if (error) {
					res.send("[ERROR]");
					console.log(error);
				} else {
					ranking = results[0].ranking;
				}
			}
		);

		db.query(`
		SELECT *, (SELECT nm_categoria FROM categorias WHERE id_categoria=anexos_usuario.id_categoria) as 'nm_categoria'
		FROM anexos_usuario 
		WHERE id_usuario = (SELECT id FROM usuarios WHERE token = ?);
		`,
			req.body.token,
			function (error, results, fields) {
				if (error) {
					res.send("[ERROR]");
					console.log(error);
				} else {
					livros = results;
				}
			}
		);

		let query = `
		SELECT nome, email, senha, uf, cidade, imagem, xp, tp_usuario, 
		(SELECT nm_escola FROM escolas WHERE id_escola = usuarios.id_escola) as 'id_escola', 
		(SELECT ds_descricao FROM emblemas WHERE usuarios.id_emblema = id_emblema) as 'ds_emblema', id_emblema 
		FROM usuarios 
		WHERE token = ?`;

		db.query(query, req.body.token, function (error, results, fields) {
			if (error) {
				res.send("[ERROR]");
				console.log(error);
			} else {
				let bufferImage = results[0].imagem;

				let base64Image = bufferImage.toString("base64");

				base64Image = base64Image.replace("dataimage", "data:image");
				if (base64Image.includes("png")) {
					base64Image = base64Image.replace("base64", ";base64,");
				} else {
					base64Image = base64Image.replace("base64", ";base64,");
				}

				if (results !== []) {
					res.send({
						image: base64Image,
						name: results[0].nome,
						email: results[0].email,
						state: results[0].uf,
						city: results[0].cidade,
						xp: results[0].xp,
						school: results[0].id_escola,
						emblema: results[0].id_emblema,
						ds_emblema: results[0].ds_emblema,
						ranking: ranking,
						tp_usuario: results[0].tp_usuario,
						livros: livros
					});
				}
			}
		});
	}
});

routes.post("/api/user/update", (req, res) => {
	if (!req.body.email) {
		res.send("[ERROR] Empty body!");
	} else {
		let token = req.body.token;
		let nome = req.body.name;
		let email = req.body.email;
		let senha = sha1(req.body.password);
		let uf = req.body.state;
		let cidade = req.body.city;
		let escola = req.body.school;
		let imagemB64 = req.body.profilePhoto;

		let imagem = Buffer.from(imagemB64, "base64");

		let query;
		if (req.body.password !== "") {
			query =
				"UPDATE usuarios SET nome = ?, email = ?, senha = ?, uf = ?, cidade = ?, imagem = ?, id_escola = ? WHERE token = ?";
			update(query, [nome, email, senha, uf, cidade, imagem, escola, token]);
		} else {
			query =
				"UPDATE usuarios SET nome = ?, email = ?, uf = ?, cidade = ?, imagem = ?, id_escola = ? WHERE token = ?";
			update(query, [nome, email, uf, cidade, imagem, escola, token]);
		}

		function update(query, params) {
			db.query(query, params, function (error, results, fields) {
				if (error) {
					if (String(error.sqlMessage).includes("Duplicate entry")) {
						res.send({ status: "[ERROR - EMAIL]" });
					}
					console.log(error);
				} else {
					res.send({ status: "[OK]" });
				}
			});
		}
	}
});

routes.get("/api/users", async (req, res) => {
	db.query(
		'SELECT imagem, nome, cidade, uf, xp, id_emblema as "emblema", token, (SELECT ds_descricao FROM emblemas WHERE usuarios.id_emblema = id_emblema) as "ds_emblema", (SELECT nm_escola FROM escolas WHERE id_escola = usuarios.id_escola) as "nm_escola" FROM usuarios WHERE tp_usuario = 2 ORDER BY xp DESC',
		function (error, results, fields) {
			if (error) {
				res.json("[ERROR] Empty body!");
				console.log(error);
			} else if (results !== []) {
				results.forEach((user) => {
					let base64Image = user.imagem.toString("base64");
					base64Image = base64Image.replace("dataimage", "data:image");

					if (base64Image.includes("png")) {
						base64Image = base64Image.replace("base64", ";base64,");
					} else {
						base64Image = base64Image.replace("base64", ";base64,");
					}

					user.imagemB64 = base64Image;
					delete user.imagem;
				});
				res.send({ data: results });
			}
		}
	);
});

routes.post("/api/schools/read", async (req, res) => {
	if (!req.body.estado) {
		res.status(500).send("[ERROR] Empty body!");
	} else {
		const estado = req.body.estado;
		const cidade = req.body.cidade;

		db.query(
			"SELECT id_escola, nm_escola FROM escolas WHERE uf = ? AND cidade = ?",
			[req.body.estado, req.body.cidade],
			function (error, results, fields) {
				if (error) {
					res.json("[ERROR] Empty abody!");
				} else {
					res.send({ data: results });
				}
			}
		);
	}
});

// Chamar view ranking_escolas
routes.get("/api/schools/ranking", async (req, res) => {
	db.query("SELECT * FROM ranking_escolas", (error, results, fields) => {
		if(error) {
			res.send({ status: '[ERROR]' })
			console.log(error)
		} else {
			res.send({ data: results })
		}
	});
});

// Criar livro para salvar no perfil ou apenas para leitura
routes.post("/api/books/create", multer(config).single("file"), (req, res) => {
	let diretorioUploads = path.resolve(__dirname, "..", "tmp", "uploads");

	if(String(req.body.isSalvar) === "true") {
		let id_categoria = parseInt(req.body.idCategoria);
		let titulo_anexo = req.body.bookName;
		
		db.query(
			"(SELECT id FROM usuarios WHERE token = ?)", req.body.token, async (error, results, fields) => {
				if (error) {
					res.send({ data: "[ERROR]" });
					console.log(error);
				} else if(results[0].id !== undefined) {
					let id_usuario = String(results[0].id);

					// Cria uma pasta para o usuario, se não tiver
					if (!fs.existsSync(path.join(__dirname, '..', 'tmp', 'uploads', id_usuario))){
						fs.mkdirSync(path.join(__dirname, '..', 'tmp', 'uploads', id_usuario));
					}
					let antigoDest = path.join(__dirname, '..', 'tmp', req.file.filename);
					let novoDest = path.join(__dirname, '..', 'tmp', 'uploads', id_usuario, req.file.filename);

					// Move o arquivo para a pasta do usuario
					fs.readFile(antigoDest, function(err, data) {
						fs.writeFile(novoDest, data, function(err) {
							fs.unlink(antigoDest, function(){
								if(err) throw err;
							});
							getBookText(novoDest);
						}); 
					});

					db.query("INSERT INTO anexos_usuario (titulo_anexo, anexo, id_categoria, id_usuario) VALUES (?, ?, ?, ?)", [titulo_anexo, req.file.filename, id_categoria, id_usuario]);
				}
			}
		);
		
	} else {
		getBookText(req.file.path);
	}

	// Extrai o texto e retorna o conteudo
	function getBookText(path) {
		pdfUtil.pdfToText(path, (err, data) => {
			return res.json({ text: data });
		});
	}
});

routes.post("/api/words/read", async (req, res) => {
	if (req.body == {}) {
		res.status(500).send("Undefined word...");
	}
	const url = `https://api.dictionaryapi.dev/api/v2/entries/en_US/${req.body.word}`;

	try {
		const response = await axios.get(url);
		let meaning = "";
		let type = "";

		if (response.data[0].meanings.length > 1) {
			if (response.data[0].meanings[0].partOfSpeech.includes("verb")) {
				for (let i = 0; i < response.data[0].meanings.length; i++) {
					let item = response.data[0].meanings[i];

					if (item.partOfSpeech == "noun") {
						type = item.partOfSpeech;
						meaning = item.definitions[0].definition;
						break;
					} else if (item.partOfSpeech == "adjective") {
						type = item.partOfSpeech;
						meaning = item.definitions[0].definition;
						break;
					} else {
						type = response.data[0].meanings[i].partOfSpeech;
						meaning = response.data[0].meanings[i].definitions[0].definition;
						break;
					}
				}
			} else {
				type = response.data[0].meanings[0].partOfSpeech;
				meaning = response.data[0].meanings[0].definitions[0].definition;
			}
		} else {
			type = response.data[0].meanings[0].partOfSpeech;
			meaning = response.data[0].meanings[0].definitions[0].definition;
		}

		const link = response.data[0].phonetics[0].audio;
		const phonetic = response.data[0].phonetics[0].text;

		
		function traduzir(word) {
			return translate(word, {
				to: "pt",
				engine: "google",
				key: process.env.GOOGLE_TRANSLATE_API,
			});
		}

		const palavra = await traduzir(req.body.word);
		const significado = await traduzir(meaning);
		const tipo = await traduzir(type);

		return res.json({
			en: {
				meaning: meaning,
				type: type,
				link: link,
				phonetic: phonetic,
			},
			pt: {
				palavra: palavra,
				significado: significado,
				tipo: tipo,
			},
		});
	} catch (error) {
		console.log(error);
		console.log(`Word ${req.body.word} not found...`);
		return res.status(500).send("Error");
	}
});

routes.post("/api/words/favorites/save", async (req, res) => {
	if (req.body === {} && req.body.word !== "") {
		res.status(500).send("Undefined word...");
	}

	let op = req.body.operation;
	let word = req.body.word;

	if (op === "save") {
		db.query(
			"INSERT INTO favoritos (palavra_favorita, id_usuario) VALUES (?, (SELECT id FROM usuarios WHERE token = ?))",
			[word, req.body.token],
			(error, results, fields) => {
				if (error) {
					res.send({ data: "[ERROR]" });
					console.log(error);
				} else {
					res.send({ data: "[OK]" });
				}
			}
		);
	} else if (op === "remove") {
		db.query(
			"DELETE FROM favoritos WHERE palavra_favorita = ? AND id_usuario = (SELECT id FROM usuarios WHERE token = ?)",
			[word, req.body.token],
			(error, results, fields) => {
				if (error) {
					res.send({ data: "[ERROR]" });
					console.log(error);
				} else {
					res.send({ data: "[OK]" });
				}
			}
		);
	}
});

routes.post("/api/words/favorites/read", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}

	db.query(
		"SELECT palavra_favorita FROM favoritos WHERE id_usuario = (SELECT id FROM usuarios WHERE token = ?)",
		req.body.token,
		(error, results, fields) => {
			if (error) {
				res.send({ data: "[ERROR]" });
				console.log(error);
			} else {
				res.send(results);
			}
		}
	);
});

// Ler uma questao do banco
routes.post("/api/question/search", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}
	let id_questao = req.body.id;

	let query = `
	SELECT questoes.ds_questao, opcoes.ds_opcao, opcoes.certo
	FROM questoes
	INNER JOIN opcoes ON questoes.id_questao = opcoes.id_questao
	WHERE questoes.id_questao = ?
	`;

	if(id_questao !== "" && id_questao !== NaN) {
		db.query(query, parseInt(id_questao), (error, results, fields) => {
			if (error) {
				res.send({ data: "[ERROR]" });
				console.log(error);
			} else {
				res.send(results);
			}
		});
	} else {
		res.send({ data: "[ERROR]" });
	}
});

// Criar uma questao
routes.post("/api/question/create", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}
	let ds_questao = req.body.ds_questao;
	let token = req.body.token;
	let lista_opcoes = req.body.opcoes;
	let idCerto = req.body.certo;


	db.query('SELECT * FROM questoes WHERE ds_questao = ?', ds_questao, (error, results, fields) => {
		if (error) {
			res.send({ status: "[ERROR]" });
			console.log(error);
		} else if(results.length > 0) {
			res.send({
				status: "[ALREADY EXISTS]",
				id: results[0].id_questao
			})
		} else {
			insertOptions();
		}
	});

	function insertOptions() {
		db.query('INSERT INTO questoes (ds_questao, id_usuario) VALUES (?, (SELECT id FROM usuarios WHERE token = ?))', [ds_questao, token], (error, results, fields) => {
			if (error) {
				res.send({ status: "[ERROR]" });
				console.log(error);
			} else {
				lista_opcoes.forEach(async (opcao) => {
					await insertOption(opcao, lista_opcoes[idCerto] === opcao ? 1 : 0);
				})

				db.query('SELECT * FROM questoes WHERE ds_questao = ?', ds_questao, (error, results, fields) => {
					res.send({ 
						status: "[CREATED]",
						id: results[0].id_questao
					})
				});
			}
		});
	}

	async function insertOption(ds_opcao, certo) {
		db.query('INSERT INTO opcoes (id_questao, ds_opcao, certo) VALUES ((SELECT id_questao FROM questoes WHERE ds_questao = ?), ?, ?);', [ds_questao, ds_opcao, certo], (error, results, fields) => {
			if (error) {
				res.send({ status: "[ERROR]" });
				console.log(error);
			}
		});
	}
});

// Atualizar uma questao do banco
routes.post("/api/question/update", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}
	let ds_questao = req.body.ds_questao;
	let antiga_ds_questao = req.body.antiga_ds_questao;
	let lista_opcoes = req.body.opcoes;
	let idCerto = req.body.certo;


	db.query('SELECT * FROM questoes WHERE ds_questao = ?', antiga_ds_questao, (error, results, fields) => {
		if (error) {
			res.send({ status: "[ERROR]" });
			console.log(error);
		} else if(results.length === 0) {
			res.send({
				status: "[NO EXISTS]",
			})
		} else {
			updateOptions();
		}
	});

	function updateOptions() {
		db.query('UPDATE questoes SET ds_questao = ? WHERE ds_questao = ?', [ds_questao, antiga_ds_questao], (error, results, fields) => {
			if (error) {
				res.send({ status: "[ERROR]" });
				console.log(error);
			} else {
				db.query('SELECT opcoes.id_opcoes FROM questoes INNER JOIN opcoes ON questoes.id_questao = opcoes.id_questao WHERE questoes.ds_questao = ?', [antiga_ds_questao], async (error, results, fields) => {
					for(let i = 0; i < 5; i++) {
						await updateOption(results[i].id_opcoes, lista_opcoes[i], lista_opcoes[idCerto] === lista_opcoes[i] ? 1 : 0);
					}
	
					res.send({ 
						status: "[UPDATED]"
					});
				});

				
			}
		});
	}

	async function updateOption(id_opcao, ds_opcao, certo) {
		db.query('UPDATE opcoes SET ds_opcao = ?, certo = ? WHERE id_opcoes = ?', [ds_opcao, certo, id_opcao]);
	}
});

// Deletar uma questao do banco
routes.post("/api/question/delete", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}
	let id_questao = parseInt(req.body.id);

	let query = 'DELETE FROM questoes WHERE questoes.id_questao = ?';

	db.query(query, id_questao, (error, results, fields) => {
		if (error) {
			console.log(error);
			res.send({ status: "[ERROR]" })
		} else {
			res.send({ status: "[OK]" })
		}
	});

});


// Ler questoes disponiveis para um usuario
routes.post("/api/questions/read", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}
	let query = `
	SELECT questoes.id_questao, questoes.ds_questao, opcoes.ds_opcao, opcoes.id_questao AS ID, opcoes.certo
	FROM questoes 
	INNER JOIN opcoes ON questoes.id_questao = opcoes.id_questao
	WHERE (questoes.id_questao NOT IN
		  (SELECT     historico.id_questao
		   FROM       historico
		   WHERE      (id_usuario = (SELECT id FROM usuarios WHERE token = ?))));`;

	db.query(query, req.body.token, (error, results, fields) => {
		if (error) {
			res.send({ data: "[ERROR]" });
			console.log(error);
		} else {
			res.send(results);
		}
	}
	);
});

// Adicionar questao ao historico do usuario
routes.post("/api/questions/history", async (req, res) => {
	if (req.body === {}) {
		res.status(500).send("Undefined word...");
	}
	let query = '';
	let id_questao = req.body.id_questao;
	let xp = req.body.xp;
	let token = req.body.token;

	db.query('UPDATE usuarios SET xp = xp + ? WHERE token = ?', [xp, token], (error, results, fields) => {
		if (error) {
			res.send({ data: "[ERROR]" });
			console.log(error);
		}
	});

	if(id_questao !== "") {
		db.query('INSERT INTO historico (id_questao, id_usuario) VALUES (?, (SELECT id FROM usuarios WHERE token = ?))', [id_questao, token], (error, results, fields) => {
			if (error) {
				res.send({ data: "[ERROR]" });
				console.log(error);
			} else {
				res.send(results);
			}
		});
	}
});


// Ler categorias
routes.get("/api/categories/read", async (req, res) => {
	db.query("SELECT * FROM categorias;", (error, results, fields) => {
		if (error) {
			console.log(error);
			res.send({ status: "[ERROR]" })
		} else {
			res.send({ data: results})
		}
	});

});

module.exports = routes;