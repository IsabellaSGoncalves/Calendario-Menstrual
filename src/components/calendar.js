import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import moment from 'moment'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { auth, database } from '../firebase-config'
import { signOut } from 'firebase/auth' 
import { useNavigate } from "react-router-dom"
import "../index.css"


const CalendarioMenstrual = () => {
  const navigate = useNavigate()
  const [date, setDate] = useState(new Date())
  const [ciclo, setCiclo] = useState([])
  const [ultimoCiclo, setUltimoCiclo] = useState(null)
  const [duracao, setDuracao] = useState(5)
  const [periodo, setPeriodo] = useState(28)
  const [ciclosSalvos, setCiclosSalvos] = useState([])
  const [userId, setUserId] = useState(null)
  const [highlightedDates, setHighlightedDates] = useState([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid) 
      } else {
        setUserId(null)  
        navigate('/')
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userId) {
      lerCiclos() 
    }
  }, [userId])

  const handleDateChange = (date) => {
    setDate(date)
    const inicioCiclo = moment(date)
    const fimCiclo = moment(date).add(duracao, 'days')
    const proximoCiclo = moment(date).add(periodo, 'days')

    if (ultimoCiclo && inicioCiclo.isSame(ultimoCiclo, 'day')) {
      return 
    }

    setUltimoCiclo(inicioCiclo)

    setCiclo([
      { tipo: 'Menstruação', data: inicioCiclo.format('DD/MM/YYYY') },
      { tipo: 'Fim da Menstruação', data: fimCiclo.format('DD/MM/YYYY') },
      { tipo: 'Próximo Ciclo', data: proximoCiclo.format('DD/MM/YYYY') },
    ])

    if (userId) {
      salvarCiclo(inicioCiclo.format('DD/MM/YYYY'), fimCiclo.format('DD/MM/YYYY'), proximoCiclo.format('DD/MM/YYYY'))
      lerCiclos()
    } else {
      alert("Você precisa estar logado para salvar o ciclo.")
    }
    
    setHighlightedDates([fimCiclo.toDate()])
  }

  const salvarCiclo = async (inicioCiclo, fimCiclo, proximoCiclo) => {
    if (!userId) return 

    console.log('Salvando ciclo:', { inicioCiclo, fimCiclo, proximoCiclo })
    try {
      const ciclosRef = collection(database, 'ciclos')
      await addDoc(ciclosRef, {
        userId: userId,  
        inicioCiclo: inicioCiclo,
        fimCiclo: fimCiclo,
        proximoCiclo: proximoCiclo,
      })
      console.log('Ciclo salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar o ciclo:', error)
    }
  }

  const delCiclo = async (cicloId) => {
    if (!userId) return 
    try {
      const cicloRef = doc(database, 'ciclos', cicloId)
      await deleteDoc(cicloRef)
      alert("Ciclo deletado com sucesso!")
      console.log('Ciclo deletado com sucesso!')
      await lerCiclos()
    } catch (error) {
      console.error('Erro ao deletar o ciclo:', error)
    } 
  }

  const lerCiclos = async () => {
    if (!userId) return 

    const ciclosRef = collection(database, 'ciclos')
    const q = query(ciclosRef, where("userId", "==", userId))  
    const snapshot = await getDocs(q)
    const ciclos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log(ciclos)
    setCiclosSalvos(ciclos)
  }

  const handleDuracaoChange = (event) => {
    setDuracao(event.target.value)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
      console.log('Usuário deslogado com sucesso!')
    } catch (error) {
      console.error('Erro ao deslogar:', error)
    }
  }

  const highlightedClassName = ({ date }) => {
    const isHighlighted = highlightedDates.some(highlightedDate => 
      moment(highlightedDate).isSame(moment(date), 'day')
    )
    return isHighlighted ? 'highlight' : 'text-gray-800'
  }
  return (
    <section className="relative bg-[linear-gradient(36.218837265614525deg,_#d92d26_7%,_#4364bc_93%)] min-h-screen">
      <div className="absolute inset-0 bg-[url('./img/bloody.png')] bg-repeat bg-opacity-50 z-0"></div>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
      <nav className="fixed top-0 left-0 w-full p-2 z-10">
        <div className="flex justify-end">
          <p className="font-bold text-white text-sm font-medium px-4 py-2"> ©IsabellaSGoncalves </p>
          {userId && (
            <button 
            onClick={handleLogout} 
            className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
            >
              Sair
            </button> 
          )}
        </div>
      </nav>
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-10">
          <h1 className="text-3xl font-bold mb-4 text-center">Calendário Menstrual</h1>
          <h2 className="mb-2 text-gray-800 text-center">Insira o início de sua Menstruação</h2>
          <div className="flex justify-center mb-4">
            <Calendar 
              onChange={handleDateChange} 
              value={date} 
              tileClassName={highlightedClassName} 
              className="mb-4 shadow-md rounded-lg" 
            />
          </div>
          <h2 className="text-xl mb-2 text-center font-bold">Defina a duração da menstruação (em dias):</h2>
          <div className="flex justify-center mb-4">
            <input
              type="number"
              value={duracao}
              onChange={handleDuracaoChange}
              min="1"
              className="border border-gray-300 rounded p-2 mb-4 w-1/2"
            />
          </div>
          <h2 className="text-xl mb-2 text-center font-bold">Ciclos Salvos:</h2>
          <ul className="shadow-md rounded-lg p-7 w-full">
            {ciclosSalvos.length > 0 ? (
              ciclosSalvos.map((ciclo, index) => (
                <li key={index} className="flex justify-between items-center border-b py-2">
                  <span>Ciclo {index + 1}: Início - {ciclo.inicioCiclo}, Fim - {ciclo.fimCiclo}, Próximo - {ciclo.proximoCiclo}</span>
                  <button 
                    onClick={() => delCiclo(ciclo.id)} 
                    className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-500">Ainda não há ciclos salvos.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
    )
}

export default CalendarioMenstrual