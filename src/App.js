import React, {useEffect, useState} from "react";
import { Form, Row, Col, Input, Card, Button, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import * as io from "socket.io-client";
import jwt from 'jsonwebtoken';

function App() {
  const [mac, setMac] = useState("");
  const [password, setPassword] = useState("");
  const [timestamp,setTimestamp] = useState(Math.floor(Date.now()*0.001))
  const [socket,setSocket] = useState(null);
  const [sessionid,setSessionid] = useState("");

  // const [auth,setAuth] = useState({});
  const [response, setResponse] = useState("");
  const [disable, setDisable] = React.useState(false);
  const [statusofstartbutton,setStatusofstartbutton] = useState(false);
  const [statusofbreakbutton,setStatusofbreakbutton] = useState(false);
  const [statusofmalfunctionbutton,setStatusofmalfunctionbutton] = useState(false);
  // const mac="01.00.02.0";
  // const mac="123.0.0.0"
  // const password="abcd1234";
  // const auth = {"mac":mac,"password":password};
  const mintime = 2
  const handleMacChange = (event) => {
    setMac(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  useEffect(()=>{
    setSocket(io('http://139.59.92.20:5000'));
  },[disable]);
  useEffect(()=>{
    if(!socket) return;
    socket.on('connect', function () {
      var auth = {"mac":mac,"password":password}
      socket.emit('authentication', auth)
    });
    socket.on('user.loggedin', function (sessionId) {
        // setSessionid(sessionId)
        console.log(sessionId)
        setSessionid(sessionId)
      });
    socket.on('order_component_mintime',function(order_component_mintime){
        console.log(order_component_mintime)
      });
    socket.on('stresponse',function(output){
        console.log(output);
      });
    socket.on('ebresponse',function(output){
        console.log(output);
      });
     socket.on('sbresponse',function(output){
        console.log(output);
      });
    socket.on('smresponse',function(output){
        console.log(output);
      });
    socket.on('emresponse',function(output){
        console.log(output);
      });
    socket.on('etresponse',function(output){
        console.log(output);
      });
    socket.on('user.logout.expired',function(output){
        console.log(output)
      });
    socket.on('disconnect',()=>{

      })
  },[socket]);
  function sendtoserver(event,timestamp){
    console.log({sessionid})
    console.log(timestamp)
    var token = jwt.sign({sessionid,mac,timestamp:timestamp},"hello ciphense")
    socket.emit(event, token)
  }
  function starttask(e){
        if (statusofbreakbutton == true)
        {
            var timeClient = Math.floor(Date.now()*0.001)
            sendtoserver("eb", timeClient);
            setStatusofbreakbutton(false);
        }
        if (statusofmalfunctionbutton == true)
        {
            var timeClient = Math.floor(Date.now()*0.001)
            sendtoserver("em", timeClient);
            setStatusofmalfunctionbutton(false);
        }
        if (statusofstartbutton == false)
        {
            var timeClient = Math.floor(Date.now()*0.001)
            setTimestamp(timeClient);
            sendtoserver("st", timeClient);
            setStatusofstartbutton(true);
        }
        else
        {
            var timeClient = Math.floor(Date.now()*0.001)
            if (timeClient - timestamp >= mintime)
            {
                sendtoserver("et", timeClient);

                setStatusofstartbutton(true);
            }
            else
            {
                console.log("Interval is less than mintime");
            }
        }
      // socket.on('stresponse',function(output){
      //   console.log(output);
      // });
      // socket.on('ebresponse',function(output){
      //   console.log(output);
      // });
      // socket.on('emresponse',function(output){
      //   console.log(output);
      // });
      // socket.on('etresponse',function(output){
      //   console.log(output);
      // });
      // socket.on('user.logout.expired',function(output){
      //   console.log(output)
      // });
  }
  // socket.on('stresponse',function(output){
  //   console.log("Received Response")
  //   console.log(output);
  // });
  // socket.on('ebresponse',function(output){
  //   console.log(output);
  // });
  // socket.on('emresponse',function(output){
  //   console.log(output);
  // });
  // socket.on('etresponse',function(output){
  //   console.log(output);
  // });
  // socket.on('user.logout.expired',function(output){
  //   console.log(output)
  // });
  function startbreak(e){
    if (statusofstartbutton == true)
       {
           var timeClient = Math.floor(Date.now()*0.001)
          if (timeClient - timestamp >= mintime)
           {
               sendtoserver("et", timeClient);
               setStatusofstartbutton(false);
               if (statusofbreakbutton == false)
               {
                   sendtoserver("sb", timeClient);
                   setStatusofbreakbutton(true);
               }
           }
           else
           {
               console.log("Interval is less than mintime");
           }
       }
       else if (statusofbreakbutton == false)
       {
           var timeClient = Math.floor(Date.now()*0.001)
           sendtoserver("sb", timeClient);
           setStatusofbreakbutton(true);
       }
       else
       {
           console.log("Start a task to end your break");
       }
  }
  function startmal(e){
    if(statusofmalfunctionbutton == false)
     {
       var timeClient = Math.floor(Date.now()*0.001)
       sendtoserver("sm",timeClient);
       setStatusofmalfunctionbutton(true);
     }
    //  socket.on('smresponse',function(output){
    //   console.log(output);
    // });
    // socket.on('user.logout.expired',function(output){
    //   console.log(output)
    // });
  }
  function disconnect(e){
    console.log('Pressed Disconnect')
    socket.disconnect(true)
  }
  function connect(e){
    setDisable(true)
    // console.log(sock)    
  }
  
  return (
    <Row type="flex" align="middle" style={{minHeight: '100vh'}}>
      <Col xs={{ span: 18, offset: 3 }} lg={{ span: 8, offset: 8 }}>
        <Card className="authcard" bordered={false}>
          {/* <img className="loginlogo" src={logo} alt="logo"></img> */}
          <Form>
            <Form.Item name="emailid">
              <Input type="text" name="mac" placeholder="Mac Id" onChange={handleMacChange} value={mac} id='macid' prefix={<UserOutlined style={{ color: "#00b359" }} />} placeholder="Mac ID" />
            </Form.Item>
            <Form.Item name="password">
              <Input.Password name="password" placeholder="Enter password" onChange={handlePasswordChange} value={password} id='passid'prefix={<LockOutlined style={{ color: "#00b359" }} />} type="password" placeholder="Password" />
            </Form.Item>
            <Form.Item type="flex" justify="center" align="middle">
                <Button styletype="primary" shape="round" size="large" style={{ backgroundColor: "black", border: "0", color: "white" }} type="submit" disabled={disable} onClick={connect}>
                  Connect
                </Button>
                <Divider type="horizontal" />  
              <Divider type="vertical" />
              <Button styletype="primary" htmlType="submit" shape="round" size="large" onClick={starttask} style={{backgroundColor:'green'}}>
                Start Task
              </Button>
              <Divider type="vertical" />
              <Button styletype="primary" htmlType="submit" shape="round" size="large" onClick={startbreak} style={{backgroundColor:'yellow'}}>
                Start Break
              </Button>
              <Divider type="vertical" />
              <Button styletype="primary" htmlType="submit" shape="round" size="large" onClick={startmal} style={{backgroundColor:'red'}}>
                Start Malfunction
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
    // <div>
    //  <form>
    //    <div>
    //     <label>Mac Id</label>
    //     <input
    //       type="text"
    //       name="mac"
    //       placeholder="Mac Id"
    //       onChange={handleMacChange}
    //       value={mac}
    //       id='macid'
    //     />
    //   </div>
    //   <div>
    //     <label>Password</label>
    //     <input
    //       type="text"
    //       name="password"
    //       placeholder="Enter password"
    //       onChange={handlePasswordChange}
    //       value={password}
    //       id='passid'
    //     />
    //   </div> 
    //   <button type="submit" disabled={disable} onClick={connect}>
    //     Connect
    //   </button>
    // </form>
    //   <div> 
    //     <p>{sessionid}</p>
    //     <button onClick={starttask} style={{backgroundColor:'green'}}>Start Task</button>
    //     <button onClick={startbreak} style={{backgroundColor:'yellow'}}>Start Break</button>
    //     <button onClick={startmal} style={{backgroundColor:'red'}}>Start Malfunction</button>
    //     <button onClick={disconnect}>Disconnect</button>
    //   </div>
    //  </div>  
      

  );
}



export default App;
