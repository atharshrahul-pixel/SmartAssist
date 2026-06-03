import { useTranslation } from 'react-i18next';
import { Mic, Square, AlertCircle } from 'lucide-react';

const TriageChat = ({
  chatHistory,
  loading,
  chatInput,
  setChatInput,
  recording,
  recordingSeconds,
  transcribing,
  micError,
  setMicError,
  triageError,
  setTriageError,
  userTurnCount,
  chatBottomRef,
  onResetChat,
  onSendMessage,
  startRecording,
  stopRecording,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card-light chat-card-container">
      <div className="chat-header">
        <div className="status-indicator">
          <div className="status-dot" />
          <span style={{ fontWeight: '700', fontSize: '15px' }}>{t('ai_triage_nurse')}</span>
        </div>
        <button
          type="button"
          onClick={onResetChat}
          className="reset-btn"
        >
          {t('reset_chat')}
        </button>
      </div>

      <div className="chat-messages chat-messages-container">
        {chatHistory.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}
            >
              <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="message-wrapper assistant">
            <div className="typing-bubble">
              <span style={{ fontSize: '13px', fontWeight: '500' }}>
                {userTurnCount >= 3 ? t('finalizing') : t('nurse_typing')}
              </span>
              <span className="dot-flashing" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {micError && (
        <div className="alert-banner">
          <AlertCircle size={16} />
          <span style={{ flex: 1 }}>{micError}</span>
          <button
            type="button"
            onClick={() => setMicError(null)}
            className="alert-banner-close"
          >
            ×
          </button>
        </div>
      )}

      {triageError && (
        <div className="alert-banner">
          <AlertCircle size={16} />
          <span style={{ flex: 1 }}>{triageError}</span>
          <button
            type="button"
            onClick={() => setTriageError('')}
            className="alert-banner-close"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={onSendMessage} className="chat-form">
        <div className="input-row">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={loading || transcribing || userTurnCount >= 3}
            className={`record-btn ${recording ? 'recording' : ''}`}
            title={recording ? "Stop recording" : "Record voice input"}
            aria-label={recording ? "Stop recording" : "Record voice input"}
          >
            {recording ? <Square size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            id="chat-input"
            className="input-field"
            aria-label={
              recording
                ? t('recording_status', { seconds: recordingSeconds })
                : transcribing
                  ? t('transcribing')
                  : userTurnCount >= 3
                    ? t('triage_completed')
                    : t('chat_placeholder')
            }
            placeholder={
              recording
                ? t('recording_status', { seconds: recordingSeconds })
                : transcribing
                  ? t('transcribing')
                  : userTurnCount >= 3
                    ? t('triage_completed')
                    : t('chat_placeholder')
            }
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={loading || userTurnCount >= 3 || recording || transcribing}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            type="submit"
            className="btn-primary send-btn"
            disabled={loading || !chatInput.trim() || chatInput.length > 500 || userTurnCount >= 3 || recording || transcribing}
          >
            {t('send')}
          </button>
        </div>
        <div className="counter-row">
          <span>
            {userTurnCount >= 3
              ? t('finalizing')
              : `${t('turn')} ${userTurnCount}/3`}
          </span>
          <span style={{ color: chatInput.length > 500 ? 'red' : 'inherit' }}>
            {chatInput.length} / 500
          </span>
        </div>
      </form>
    </div>
  );
};

export default TriageChat;
