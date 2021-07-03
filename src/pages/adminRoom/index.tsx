import { useHistory, useParams } from 'react-router-dom';

import logoImg from '../../assets/images/logo.svg';
import deleteImg from '../../assets/images/delete.svg';
import checkImg from '../../assets/images/check.svg';
import answerImg from '../../assets/images/answer.svg';
import deleteQuestionImg from '../../assets/images/deleteQuestion.svg';
import deleteRoomImg from '../../assets/images/deleteRoom.svg';

import { Button } from '../../components/button';
import { RoomCode } from '../../components/roomCode';
import { Question } from '../../components/question';

import { RoomStyled } from '../room/styles';
import '../../styles/modal.scss';

import { useRoom } from '../../hooks/useRoom';
import { database } from '../../services/firebase';
import { useEffect, useState } from 'react';
import { useAuth } from "../../hooks/useAuth";

import Modal from 'react-modal';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const { title, questions, room } = useRoom(roomId);
  const [isModalQuestionOpen, setModalQuestionOpen] = useState(false);
  const [isModalRoomOpen, setModalRoomOpen] = useState(false);
  const { user } = useAuth();
  const [questionIdModalOpen, setQuestionIdModalOpen] = useState<string>('');
  const [isModalAuthorizationOpen, setModalAuthorizationOpen] = useState(false);

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
    questionId ? setModalQuestionOpen(true) : setModalQuestionOpen(false);
    setQuestionIdModalOpen(questionId);
  }

  async function handleDeleteQuestion(questionId: string) {
    questionId && await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    setModalQuestionOpen(false);
  }

  async function handleRedirectHome() {
    setModalAuthorizationOpen(false);
    history.push('/');
  }

  useEffect(() => {
    if (room?.authorId !== user?.id) {
      setModalAuthorizationOpen(true);
    }
  }, [room]);

  return (
    <RoomStyled>
      <header>
        <div className="content">
          <img src={logoImg} alt="letmeask"/>
          <div>
          <RoomCode code={roomId}/>
          <Button isOutlined onClick={() => setModalRoomOpen(true)} disabled={room?.endedAt && true}>Encerrar sala</Button>
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
                  disabled={room?.endedAt && true}
                  >
                    <img src={checkImg} alt="Marcar perguntar como respondida"/>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHighLightQuestion(question.id)}
                    disabled={room?.endedAt && true}
                  >
                    <img src={answerImg} alt="Dar destaque a pergunta"/>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleModalQuestionDelete(question.id)}
                disabled={room?.endedAt && true}
              >
                <img src={deleteImg} alt="Remover pergunta"/>
              </button>
            </Question>
            );
          })}
        </div>
        <Modal className="delete-modal-question"
          isOpen={isModalQuestionOpen}
          onRequestClose={() => setModalQuestionOpen(false)}
          overlayClassName="overlay"
          ariaHideApp={false}
        > 
          <div className="container-delete-modal-question">
            <img src={deleteQuestionImg} alt="Confirmar exclusão"/>
            <h1>Excluir pergunta</h1>
            <span>Tem certeza que você deseja excluir esta pergunta?</span>
            <div className="container-buttons-delete-modal-question">
              <Button onClick={() => setModalQuestionOpen(false)}>Cancelar</Button>
              <Button onClick={() => handleDeleteQuestion(questionIdModalOpen)}>Sim, encerrar</Button>         
            </div>
          </div>
        </Modal>

        <Modal className="delete-modal-question"
          isOpen={isModalRoomOpen}
          onRequestClose={() => setModalRoomOpen(false)}
          overlayClassName="overlay"
          ariaHideApp={false}
        > 
          <div className="container-delete-modal-question">
            <img src={deleteRoomImg} alt="Confirmar exclusão"/>
            <h1>Encerrar sala</h1>
            <span>Tem certeza que você deseja encerrar esta sala?</span>
            <div className="container-buttons-delete-modal-question">
              <Button onClick={() => setModalRoomOpen(false)}>Cancelar</Button>
              <Button onClick={handleEndRoom}>Sim, encerrar</Button>         
            </div>
          </div>
        </Modal>

        <Modal className="delete-modal-question"
          isOpen={isModalAuthorizationOpen}
          onRequestClose={() => handleRedirectHome()}
          overlayClassName="overlay"
          ariaHideApp={false}
        > 
          <div className="container-delete-modal-question">
            <img src={deleteRoomImg} alt="Confirmar exclusão"/>
            <h1>Não autorizado</h1>
            <span>Você não pode administrar essa sala!</span>
            <div className="container-buttons-delete-modal-question">
              <Button onClick={() => handleRedirectHome()}>OK</Button>         
            </div>
          </div>
        </Modal>

      </main>
    </RoomStyled>
  )
}