import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Messages() {
  const { user, token } = useAuth()
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const bottomRef = useRef(null)

  useEffect(function() {
    if (location.state && location.state.receiverId) {
      setSelectedConversation({ id: location.state.receiverId, name: location.state.stadiumName || 'Stadium Owner' })
    }
    loadMessages()
  }, [])

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedConversation])

  function loadMessages() {
    fetch('/api/messages', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json() })
      .then(function(data) { setMessages(data) })
  }

  function getConversations() {
    var seen = {}
    var convos = []
    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i]
      var otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId
      var otherName = msg.senderId === user.id ? msg.receiverName : msg.senderName
      if (!seen[otherId]) {
        seen[otherId] = true
        convos.push({ id: otherId, name: otherName })
      }
    }
    return convos
  }

  function getConversationMessages() {
    if (!selectedConversation) return []
    return messages.filter(function(msg) {
      return msg.senderId === selectedConversation.id || msg.receiverId === selectedConversation.id
    })
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ receiverId: selectedConversation.id, content: newMessage })
    })

    setNewMessage('')
    loadMessages()
  }

  var conversations = getConversations()
  var chatMessages = getConversationMessages()

  return (
    <div className="msg-container">
      <div className="msg-sidebar">
        <div className="msg-sidebar-header">Messages</div>

        {conversations.length === 0 && (
          <div style={{ padding: '24px', color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>&#128172;</p>
            <p>{user && user.role === 'owner'
              ? 'No messages yet. Users will contact you from stadium pages.'
              : 'No messages yet. Visit a stadium to message its owner.'}</p>
          </div>
        )}

        {conversations.map(function(convo) {
          var isSelected = selectedConversation && selectedConversation.id === convo.id
          return (
            <div key={convo.id}
              onClick={function() { setSelectedConversation(convo) }}
              className={'msg-convo-item' + (isSelected ? ' msg-convo-item-active' : '')}>
              <div className="msg-avatar msg-avatar-green">
                {convo.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '14px' }}>{convo.name}</span>
            </div>
          )
        })}
      </div>

      <div className="msg-chat-area">
        {selectedConversation ? (
          <div className="msg-chat-header">
            <div className="msg-avatar msg-avatar-white">
              {selectedConversation.name.charAt(0).toUpperCase()}
            </div>
            {selectedConversation.name}
          </div>
        ) : (
          <div className="msg-chat-header">Select a conversation</div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!selectedConversation && (
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#9ca3af' }}>
              <p style={{ fontSize: '40px', marginBottom: '8px' }}>&#128172;</p>
              <p style={{ fontSize: '15px' }}>Select a conversation to start chatting</p>
            </div>
          )}

          {chatMessages.map(function(msg) {
            var isMine = msg.senderId === user.id
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div className={'msg-bubble ' + (isMine ? 'msg-bubble-mine' : 'msg-bubble-other')}>
                  <p style={{ margin: 0, fontSize: '14px' }}>{msg.content}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {selectedConversation && (
          <form onSubmit={handleSend} className="msg-input-bar">
            <input
              type="text"
              value={newMessage}
              onChange={function(e) { setNewMessage(e.target.value) }}
              placeholder="Type a message..."
              className="msg-input"
            />
            <button type="submit" className="msg-send-btn">Send</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Messages
