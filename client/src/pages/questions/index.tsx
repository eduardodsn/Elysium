import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Sidebar from "../../components/Sidebar";
import styles from "../../styles/components/Questions.module.css";
import { GetServerSideProps } from "next";
import { useData } from "../../contexts/UserData";
import toast, { Toaster } from "react-hot-toast";
import router, { useRouter } from "next/router";
import Cookie from "js-cookie";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import axios from "axios";


export default function questions(props) {
	const btnRef = useRef<HTMLInputElement>(null);

	const router = useRouter();
	const contextUserData = useData();
	const [userQuestions, setUserQuestions] = useState(undefined);
	const [currentQuestionId, setCurrentQuestionId] = useState(1);
	const [currentQuestionDs, setCurrentQuestionDs] = useState("");
	const [currentQuestionOptions, setCurrentQuestionOptions] = useState([]);
	const [currentRightAnswer, setCurrentRightAnswer] = useState("");
	const [selected, setSelected] = useState("");
	const [questionIdDb, setQuestionIdDb] = useState(undefined);
	const [xpSum, setXpSum] = useState(0);
	const incorrectAnswerXp = 25;

	const getQuestions = async () => {
		let res = await axios.post(`${process.env.API_URL}/api/questions/read`, {
			token: Cookie.get('token'),
		});
		setUserQuestions(res.data);
	};

	useEffect(() => {
		setUserQuestions(props.data);
		if (props.data.length === 0) {
			setCurrentQuestionDs("There's no question anymore. Coming soon!");
		}
	}, []);

	useEffect(() => {
		if(currentQuestionOptions === []) {
			setCurrentQuestionDs("There's no questions anymore");
			setCurrentQuestionOptions([]);
		}
	}, [currentQuestionOptions])

	useEffect(() => {
		if (userQuestions !== undefined && userQuestions[0] && userQuestions !== []) {
			setCurrentQuestionId(userQuestions[0].id_questao);
			for (let i = 0; i < userQuestions.length/5; i++) {
				if (userQuestions[i].id_questao === currentQuestionId) {
					let options = [];
					setQuestionIdDb(userQuestions[i].id_questao);

					for (let id = i; id < i + 5; id++) {
						if (userQuestions[id].id_questao === currentQuestionId) {
							options.push(userQuestions[id].ds_opcao);
						}

						if (userQuestions[id].certo.data[0] === 1) {
							setCurrentRightAnswer(userQuestions[id].ds_opcao.toLowerCase());
						}
					}

					setCurrentQuestionDs(userQuestions[i].ds_questao);
					setCurrentQuestionOptions(options);
					break;
				}
			}
		} else {
			setCurrentQuestionDs("There's no questions anymore");
			setCurrentQuestionOptions([]);
		}
	}, [userQuestions, currentQuestionId]);

	function addQuestionHistory(xp, id_questao) {
		axios.post(`${process.env.API_URL}/api/questions/history`, {
			id_questao: id_questao,
			xp: xp,
			token: Cookie.get('token')
		})
	}

	async function handleNext(e) {
		if (selected === "") {
			toast.error("Select an option or click FINISH!");
			e.target.removeAttribute("disabled");
			return;
		}

		if (currentRightAnswer) {
			if (selected !== currentRightAnswer) {
				addQuestionHistory(-incorrectAnswerXp, "")
				toast.error("Incorret answer, try again. You lost 25 xp! 🤞🥺");
				setXpSum(xpSum - incorrectAnswerXp);
			} else {
				addQuestionHistory(100, questionIdDb)
				setXpSum(xpSum + 100);
				toast.success("Awesome, that's correct! +100 xp! 👏");
				getQuestions();
			}
		} else {
			setCurrentQuestionDs("There's no questions anymore");
			setCurrentQuestionOptions([]);
		}
		setSelected("");
		e.target.removeAttribute("disabled");
	}

	function handleFinish() {
		setUserQuestions(undefined);
		if (currentRightAnswer != "") {
			if (xpSum > 0) {
				toast(`Good job. You got ${xpSum} xp!`, {
					duration: 2000,
					icon: "👏",
					style: {
						background: "#333",
						color: "#fff",
					},
				});
				setTimeout(() => {
					router.push("/ranking");
				}, 2000);
			} else {
				toast(`You didn't get xp, answer some questions!`, {
					icon: "🤨",
					style: {
						background: "#333",
						color: "#fff",
					},
				});
			}
		} else {
			toast(`There's no more questions. Coming soon!`, {
				icon: "😔",
				style: {
					background: "#333",
					color: "#fff",
				},
			});
		}
	}

	return (
		<div
			className={`${styles.questionsPage} ${contextUserData.isSwitchChecked ? styles.darkBackground : ""
				}`}
		>
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
				<title>Questions | Elysium</title>
			</Head>
			<div
				className={`${styles.sidebarHome} ${contextUserData.isSwitchChecked ? styles.darkSidebar : ""
					}`}
			>
				<Sidebar />
			</div>
			<h1
				className={`${styles.questionsTitle} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""}`}
			>
				Questions Database{" "}
			</h1>
			<div
				className={`${styles.questionsContainer} ${contextUserData.isSwitchChecked ? styles.darkBackground : ""
					}`}
			>
				<div
					className={`${styles.questionsCard} ${contextUserData.isSwitchChecked ? styles.darkCard : ""
						}`}
				>
					<header>{currentQuestionDs ? currentQuestionDs : ""}</header>
					<div className={styles.radioContainer}>
						<div className={styles.option}>
							<label>
							<input
								type="radio"
								checked={
									selected
										? selected.toLowerCase() ===
										currentQuestionOptions[0].toLowerCase()
										: undefined
								}
								value={
									currentQuestionOptions[0] ? currentQuestionOptions[0] : ""
								}
								onChange={(e) => {
									setSelected(e.target.value.toLowerCase());
								}}
								onClick={(e) => {
									setSelected(e.currentTarget.value);
								}}
							/>
								{currentQuestionOptions[0] ? currentQuestionOptions[0] : ""}
							</label>
						</div>
						<div className={styles.option}>
							<label>
							<input
								type="radio"
								name="option"
								checked={
									selected
										? selected.toLowerCase() ===
										currentQuestionOptions[1].toLowerCase()
										: undefined
								}
								value={
									currentQuestionOptions[1] ? currentQuestionOptions[1] : ""
								}
								onChange={(e) => {
									setSelected(e.target.value.toLowerCase());
								}}
								onClick={(e) => {
									setSelected(e.currentTarget.value);
								}}
							/>
								{currentQuestionOptions[1] ? currentQuestionOptions[1] : ""}
							</label>
						</div>
						<div className={styles.option}>
							<label>
							<input
								type="radio"
								name="option"
								checked={
									selected
										? selected.toLowerCase() ===
										currentQuestionOptions[2].toLowerCase()
										: undefined
								}
								value={
									currentQuestionOptions[2] ? currentQuestionOptions[2] : ""
								}
								onChange={(e) => {
									setSelected(e.target.value.toLowerCase());
								}}
								onClick={(e) => {
									setSelected(e.currentTarget.value);
								}}
							/>
								{currentQuestionOptions[2] ? currentQuestionOptions[2] : ""}
							</label>
						</div>
						<div className={styles.option}>
							<label>
							<input
								type="radio"
								name="option"
								checked={
									selected
										? selected.toLowerCase() ===
										currentQuestionOptions[3].toLowerCase()
										: undefined
								}
								value={
									currentQuestionOptions[3] ? currentQuestionOptions[3] : ""
								}
								onChange={(e) => {
									setSelected(e.target.value.toLowerCase());
								}}
								onClick={(e) => {
									setSelected(e.currentTarget.value);
								}}
							/>
								{currentQuestionOptions[3] ? currentQuestionOptions[3] : ""}
							</label>
						</div>
						<div className={styles.option}>
							<label>
							<input
								type="radio"
								name="option"
								checked={
									selected
										? selected.toLowerCase() ===
										currentQuestionOptions[4].toLowerCase()
										: undefined
								}
								value={
									currentQuestionOptions[4] ? currentQuestionOptions[4] : ""
								}
								onChange={(e) => {
									setSelected(e.target.value.toLowerCase());
								}}
								onClick={(e) => {
									setSelected(e.currentTarget.value);
								}}
							/>
								{currentQuestionOptions[4] ? currentQuestionOptions[4] : ""}
							</label>
						</div>
					</div>
					<div
						className={`${styles.bottomButtons} ${contextUserData.isSwitchChecked ? styles.darkTitle : ""
							}`}
					>
						<button
							ref={btnRef}
							onClick={(e) => {
								e.currentTarget.setAttribute("disabled", "disabled");
								handleNext(e);
							}}
						>
							Next
						</button>
						<button onClick={() => handleFinish()}>Finish</button>
					</div>
				</div>
			</div>
			<ThemeSwitcher className={styles.switchButton} />
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const { token } = req.cookies;

	if (!token) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	} else {
		let res = await axios.post(`${process.env.API_URL}/api/user/data`, {
			token: token,
		});

		if (res.data.tp_usuario === 1) {
			//Professor - não tem acesso
			return {
				redirect: {
					destination: "/questions/create",
					permanent: false,
				},
			};
		}
	}

	let res = await axios.post(`${process.env.API_URL}/api/questions/read`, {
		token: token,
	});

	return {
		props: { data: res.data },
	};
};
