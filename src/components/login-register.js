import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase-config" 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { sendEmailVerification } from "firebase/auth"
import { getFirestore, setDoc, doc } from "firebase/firestore"  
import "../index.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import landPageImage from '../img/land_page.png'

const LoginRegister = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [isResetPassword, setIsResetPassword] = useState(false)
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [resetEmail, setResetEmail] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData({
      ...loginData,
      [name]: value,
    })
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterData({
      ...registerData,
      [name]: value,
    })
  }

  const handleResetChange = (e) => {
    setResetEmail(e.target.value) 
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      const user = userCredential.user

      if (!user.emailVerified) {
        alert("Por favor, verifique seu email antes de fazer login.")
        return 
      }

      const db = getFirestore()
      const userRef = doc(db, "usuarios", user.uid)
      console.log("Usuário logado:", user)

      navigate("/calendario")
    } catch (error) {
      console.log(error) 
      const errorCode = error.code
      if (errorCode === "auth/user-not-found") {
        alert("Usuário não encontrado!")
      } else if (errorCode === "auth/wrong-password") {
        alert("Senha incorreta!")
      } else {
        alert("Erro ao fazer login: " + error.message)
      }
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password)
      const user = userCredential.user
      const db = getFirestore()
      const userRef = doc(db, "usuarios", user.uid)
      await setDoc(userRef, {
        nome: registerData.name,
        email: registerData.email,
        dataCriacao: new Date(),
      })

      await sendEmailVerification(user)
      alert("Registro bem-sucedido! Um email de verificação foi enviado. Você pode fazer login agora.")
      setIsLogin(true)
    } catch (error) {
      console.log(error) 
      const errorCode = error.code
      if (errorCode === "auth/email-already-in-use") {
        alert("Este e-mail já está em uso.")
      } else {
        alert("Erro ao registrar: " + error.message)
      }
    }
  }

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user

        const db = getFirestore()
        const userRef = doc(db, "usuarios", user.uid)
        setDoc(userRef, {
          nome: user.displayName || 'Usuário do Google',
          email: user.email,
          dataCriacao: new Date(),
        })

        navigate("/calendario")
        console.log("Google Login Success:", user)
      })
      .catch((error) => {
        console.error("Google Login Error:", error)
      })
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      alert("E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.")
      setIsResetPassword(false) 
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição de senha:", error)
      alert("Erro ao enviar e-mail de redefinição de senha: " + error.message)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  return (
    <section className="relative bg-[linear-gradient(163.48472565622978deg,_#e81740_-40%,_#b98046_140%)] min-h-screen">
      <div className="absolute inset-0 bg-[url('./img/calendar.png')] bg-repeat bg-opacity-50 z-0"></div>
      <div className="flex items-center justify-around min-h-screen p-6 relative z-10">
      <div className="flex-1 max-w-xl">
        <img className="h-auto max-w-full" src={landPageImage} alt="land-tampon" />
      </div>
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {isResetPassword ? "Mudar a senha" : isLogin ? "Login" : "Crie uma conta"}
            </h1>
            {isResetPassword ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Seu email</label>
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={handleResetChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  />
                </div>
                <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Enviar email de recuperação</button>
                <p onClick={() => setIsResetPassword(false)} className="text-sm font-medium text-primary-600 hover:underline">Voltar</p>
              </form>
            ) : isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      id="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p onClick={() => setIsResetPassword(true)} className="text-sm font-medium text-primary-600 hover:underline">Esqueceu sua senha?</p>
                </div>
                <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Logar-se</button>
                <p onClick={() => setIsLogin(!isLogin)} className="text-sm font-light text-gray-500">
                  {isLogin
                    ? "Não possui uma conta? Clique aqui para registrar-se." 
                    : "Já possui uma conta? Clique aqui para logar-se."}
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Nome</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      id="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Confirmar senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} 
                      name="confirmPassword"
                      id="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Registrar-se</button>
                <p onClick={() => setIsLogin(!isLogin)} className="text-sm font-light text-gray-500">
                  {isLogin
                    ? "Não possui uma conta? Clique aqui para registrar-se."
                    : "Já possui uma conta? Clique aqui para logar-se."}
                </p>              
              </form>
            )}
            <div>
              { !isResetPassword && isLogin ? (
                <button onClick={handleGoogleLogin} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Login com Google</button>
              ) : ""} 
            </div>
            <p className="font-bold text-gray-500 text-sm font-medium"> ©IsabellaSGoncalves </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginRegister