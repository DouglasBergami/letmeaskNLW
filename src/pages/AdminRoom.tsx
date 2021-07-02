import { useHistory, useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import confirmDeleteImg from '../assets/images/confirmDelete.svg';

import { Button } from '../components/button';
import { RoomCode } from '../components/roomCode';
import { Question } from '../components/question';

import '../styles/room.scss';

import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';
import { useState } from 'react';

import Modal from 'react-modal';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const { title, questions } = useRoom(roomId);
  const [isModalOpen, setModalOpen] = useState(false);
  const [questionIdModalOpen, setQuestionIdModalOpen] = useState<string>('');

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })

    history.push('/');
  }

  async function handleCheckQuestionsAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    })
  }

  async function handleHighLightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighLighted: true,
    })
  }

  function handleModalQuestionDelete(questionId: string) {
    questionId ? setModalOpen(true) : setModalOpen(false);
    setQuestionIdModalOpen(questionId);
  }

  async function handleDeleteQuestion(questionId: string) {
    questionId && await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    setModalOpen(false);
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="letmeask"/>
          <div>
          <RoomCode code={roomId}/>
          <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
          </div>          
        </div>
      </header>

      <main>
        <div className="room-title">
        <h1>{title}</h1>
        {questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
        </div>

        <div className="question-list">
          { questions.map(question => {
            return (
            <Question 
            key={question.id}
            author={question.author} 
            content={question.content}
            isAnswered={question.isAnswered}
            isHighLighted={question.isHighLighted}
            >
              {!question.isAnswered && (
                <>
                  <button
                  type="button"
                  onClick={() => handleCheckQuestionsAsAnswered(question.id)}
                  >
                    <img src={checkImg} alt="Marcar perguntar como respondida"/>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHighLightQuestion(question.id)}
                  >
                    <img src={answerImg} alt="Dar destaque a pergunta"/>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleModalQuestionDelete(question.id)}
              >
                <img src={deleteImg} alt="Remover pergunta"/>
              </button>
            </Question>
            );
          })}
        </div>
        <Modal className="delete-modal-question"
          isOpen={isModalOpen}
          onRequestClose={() => setModalOpen(false)}
          overlayClassName="overlay"
          ariaHideApp={false}
        > 
          <div className="container-delete-modal-question">
            <img src={confirmDeleteImg} alt="Confirmar exclusão"/>
            <h1>Encerrar sala</h1>
            <span>Tem certeza que você deseja encerrar esta sala?</span>
            <div className="container-buttons-delete-modal-question">
              <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={() => handleDeleteQuestion(questionIdModalOpen)}>Sim, encerrar</Button>         
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}