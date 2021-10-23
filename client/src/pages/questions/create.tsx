import { GetServerSideProps } from 'next';
import Head from 'next/head'
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/components/Questions.module.css'
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { useData } from '../../contexts/UserData';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import Cookie from 'js-cookie'



export default function CreateQuestions() {
	const userData = useData()

	const [questionId, setQuestionId] = useState("");
	const [questionDs, setQuestionDs] = useState("");
	const [altA, setAltA] = useState("");
	const [altB, setAltB] = useState("");
	const [altC, setAltC] = useState("");
	const [altD, setAltD] = useState("");
	const [altE, setAltE] = useState("");
	const [correctAns, setCorrectAns] = useState(-1)
	const [isDeleteSelected, setIsDeleteSelected] = useState(false)
	const [oldQuestionDs, setOldQuestionDs] = useState("")

	function clearFields() {
		setQuestionId("")
		setQuestionDs("")
		setAltA("")
		setAltB("")
		setAltC("")
		setAltD("")
		setAltE("")
		setCorrectAns(-1)
	}

	function searchQuestion(e) {
		e.preventDefault();

		if(questionId !== "") {
			axios.post(`${process.env.API_URL}/api/question/search`, {
				id: questionId
			}).then((res) => {
				if(res.data.length !== 0) {
					setQuestionDs(res.data[0].ds_questao)
					setOldQuestionDs(res.data[0].ds_questao)

					setAltA(res.data[0].ds_opcao)
					setAltB(res.data[1].ds_opcao)
					setAltC(res.data[2].ds_opcao)
					setAltD(res.data[3].ds_opcao)
					setAltE(res.data[4].ds_opcao)

					for(let i = 0; i < res.data.length; i++) {
						if(res.data[i].certo.data[0] === 1) {
							setCorrectAns(i)
						}
					}
				} else {
					clearFields();
					toast.error("There's not question with this id!");
				}
			});
		}
	}

	function deleteQuestion(e) {
		e.preventDefault()

		if(questionId !== "") {
			axios.post(`${process.env.API_URL}/api/question/delete`, {
				id: questionId
			}).then((res) => {
				if(res.data.status === "[OK]") {
					toast.success("Question deleted successfully!");
					clearFields();
					setIsDeleteSelected(false);
				} else {
					toast.error("Error on deleting question, try again!");
				}
			});
		}
	}

	function createQuestion(e) {
		e.preventDefault()

		if(altA !== "" && altB !== "" && altC !== "" && altD !== "" && altE !== "" && questionDs !== "" && correctAns !== -1) {

			let options = [altA, altB, altC, altD, altE]
			
			axios.post(`${process.env.API_URL}/api/question/create`, {
				token: Cookie.get('token'),
				ds_questao: questionDs,
				opcoes: options,
				certo: correctAns
			}).then((res) => {
				if(res.data.status === "[CREATED]") {
					setOldQuestionDs(questionDs);
					setQuestionId(res.data.id);

					toast.success(`Question created successfully with id ${res.data.id}!`)
				} else if(res.data.status === "[ALREADY EXISTS]") {
					toast.error(`This question already exists with id ${res.data.id}!`)
				} else {
					toast.error("Error on creating question, try again!")
				}
			})
		} else {
			toast.error('Fill all the fields to create a question! No need to set an id.')
		}
	}

	function updateQuestion(e) {
		e.preventDefault()

		if(altA !== "" && altB !== "" && altC !== "" && altD !== "" && altE !== "" && questionDs !== "" && correctAns !== -1) {
		
			let options = [altA, altB, altC, altD, altE]

			axios.post(`${process.env.API_URL}/api/question/update`, {
				ds_questao: questionDs,
				antiga_ds_questao: oldQuestionDs,
				opcoes: options,
				certo: correctAns
			}).then((res) => {
				if(res.data.status === "[UPDATED]") {
					toast.success("Questions updated successfully!")
				} else if(res.data.status === "[NO EXISTS]") {
					toast.error(`This question does not exists!`)
				} else {
					toast.error("Error on updating question, try again!")
				}
			});
		} else {
			toast.error('Fill all the fields to update a question! No need to set an id.')
		}

	}

	return (
		<div className={`${styles.questionsPage} ${userData.isSwitchChecked ? styles.darkBackground : ""}`}>
			<Toaster
				position="top-right"
				reverseOrder={false}
				toastOptions={{
					className: "",
					style: {
						padding: "16px",
						color: "#FFF",
						background: "#1E1F2B",
						font: '500 1.2vw "Roboto", sans-serif',
					},
				}}
			/>
			<Head>
				<title>Create Questions | Elysium</title>
				<link rel="shortcut icon" href="/assets/logo.png" type="image/png"/>
			</Head>
			<div className={`${styles.sidebarHome} ${userData.isSwitchChecked ? styles.darkSidebar : ""}`}>
				<Sidebar />
			</div>
			<h1 className={`${styles.questionsTitle} ${userData.isSwitchChecked ? styles.darkTitle : ""}`}>Create Questions</h1>

			<div className={`${styles.deleteModal} ${userData.isSwitchChecked ? styles.darkDeleteModal : ""}`} style={{display: isDeleteSelected ? 'flex' : 'none'}}>
				<h2>Are you sure you want to DELETE your account?</h2>
				<div>
					<button onClick={() => setIsDeleteSelected(false)}>No</button>
					<button onClick={(e) => deleteQuestion(e)}>Yes</button>
				</div>
			</div>

			<div className={`${styles.formContainer}`}>
				<form className={`${userData.isSwitchChecked ? styles.darkCard : ""}`}>
					<div className={styles.searchQuestion}>
						<input type="text" name="search" placeholder="Search question by id" autoComplete="off" value={questionId} onChange={(e) => setQuestionId(e.target.value)}/>
						<button onClick={(e) => searchQuestion(e)}>Search</button>
					</div>

					<div className={styles.questionData}>
						<label htmlFor="description">Question</label>
						<input type="text" name="description" className={styles.dsQuestion} autoComplete="off" value={questionDs} onChange={(e) => setQuestionDs(e.target.value)}/>

						<label htmlFor="altA">A</label>
						<input type="text" name="altA" className={styles.alts} autoComplete="off" value={altA} onChange={(e) => setAltA(e.target.value)}/>
						
						<label htmlFor="altB">B</label>
						<input type="text" name="altB" className={styles.alts} autoComplete="off" value={altB} onChange={(e) => setAltB(e.target.value)}/>
						
						<label htmlFor="altC">C</label>
						<input type="text" name="altC" className={styles.alts} autoComplete="off" value={altC} onChange={(e) => setAltC(e.target.value)}/>

						<label htmlFor="altD">D</label>
						<input type="text" name="altD" className={styles.alts} autoComplete="off" value={altD} onChange={(e) => setAltD(e.target.value)}/>

						<label htmlFor="altE">E</label>
						<input type="text" name="altE" className={styles.alts} autoComplete="off" value={altE} onChange={(e) => setAltE(e.target.value)}/>

						<div className={styles.correctBox}>
							<label className={styles.firstLabel}>Correct:</label>
							<label>A
								<input checked={correctAns === 0 ? true : false} onClick={() => setCorrectAns(0)} className={styles.correctInput} type="radio" name="correctAnswer"/>
							</label>

							<label>B
								<input checked={correctAns === 1 ? true : false} onClick={() => setCorrectAns(1)} className={styles.correctInput} type="radio" name="correctAnswer"/>
							</label>

							<label>C
								<input checked={correctAns === 2 ? true : false} onClick={() => setCorrectAns(2)} className={styles.correctInput} type="radio" name="correctAnswer"/>
							</label>

							<label>D
								<input checked={correctAns === 3 ? true : false} onClick={() => setCorrectAns(3)} className={styles.correctInput} type="radio" name="correctAnswer"/>
							</label>

							<label>E
								<input checked={correctAns === 4 ? true : false} onClick={() => setCorrectAns(4)} className={styles.correctInput} type="radio" name="correctAnswer"/>
							</label>
						</div>
					</div>

					<div className={styles.createQuestionButtons}>
						<button onClick={(e) => {
							e.preventDefault();
							if(questionId !== "") {
								setIsDeleteSelected(true)
							} else {
								toast.error("No question selected to be deleted!")
							}
						}} className={styles.deleteButton}>Delete</button>
						<div>
							<button onClick={(e) => updateQuestion(e)} className={styles.updateButton}>Update</button>
							<button onClick={(e) => createQuestion(e)} className={styles.createButton}>Create</button>
						</div>
					</div>
				</form>
			</div>
			<ThemeSwitcher className={styles.switchButton} />
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const { token } = req.cookies

	if (!token) {
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		}
	} else {
		let res = await axios.post(`${process.env.API_URL}/api/user/data`, {
			token: token,
		});

		if (res.data.tp_usuario === 2) {
			//Aluno - não tem acesso
			return {
				redirect: {
					destination: "/questions",
					permanent: false,
				},
			};
		}
	}
	return {
		props: {}
	}
}