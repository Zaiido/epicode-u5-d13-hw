import { useEffect, useState } from "react"
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
} from "react-bootstrap"
import { io } from "socket.io-client"
import { User } from "../types"
import { Message } from "../types"


const socket = io("http://localhost:3001", { transports: ["websocket"] })


const Home = () => {
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [usersList, setUsersList] = useState<User[]>([])
  const [allMessages, setAllMessages] = useState<Message[]>([])

  useEffect(() => {
    socket.on("welcome", message => {
      console.log(message)
    })

    socket.on("loggedIn", usersList => {
      setUsersList(usersList)
      setLoggedIn(true)
    })

    socket.on("updatedUsersList", updatedUsersList => {
      setUsersList(updatedUsersList)
    })

    socket.on("newMessage", newMessage => {
      setAllMessages((allMessages) => [...allMessages, newMessage.message])
    })

  }, [])


  return (
    <Container fluid>
      <Row style={{ height: "95vh" }} className="my-3">
        <Col md={9} className="d-flex flex-column justify-content-between">
          {/* LEFT COLUMN */}
          {/* TOP AREA: USERNAME INPUT FIELD */}
          {!loggedIn && (
            <Form
              onSubmit={e => {
                e.preventDefault()
                socket.emit("setUsername", { username })
              }}
            >
              <FormControl
                placeholder="Set your username here"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </Form>
          )}
          {/* MIDDLE AREA: CHAT HISTORY */}
          <ListGroup>
            {allMessages.map((message, index) => (<ListGroup.Item key={index}>{<strong>{message.sender} </strong>} | {message.text} at {message.createdAt}</ListGroup.Item>))}
          </ListGroup>
          {/* BOTTOM AREA: NEW MESSAGE */}
          {loggedIn && <Form
            onSubmit={e => {
              e.preventDefault()
              const newMessage = {
                sender: username,
                text: message,
                createdAt: new Date().toLocaleString("en-UK")
              }
              socket.emit("sendMessage", { message: newMessage })
              setAllMessages([...allMessages, newMessage])
            }}
          >
            <FormControl
              placeholder="Write your message here"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </Form>}
        </Col>
        <Col md={3}>
          {/* ONLINE USERS SECTION */}
          <div className="mb-3">Connected users:</div>
          {usersList.map(user => <ListGroup.Item key={user.socketId}>{user.username}</ListGroup.Item>)}
        </Col>
      </Row>
    </Container>
  )
}

export default Home
