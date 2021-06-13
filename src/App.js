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
  const [valueofstart,setStart] = useState('Start Task')
  const [valueofbreak,setBreak] = useState('Start Break')
  const [valueofmal,setMal] = useState('Start Malfunction')
  const [statusofbreakbutton,setStatusofbreakbutton] = useState(false);
  const [statusofmalfunctionbutton,setStatusofmalfunctionbutton] = useState(false);
  const [mintime,setMintime] = useState(2)
  // const mac="01.00.02.0";
  // const mac="123.0.0.0"
  // const password="abcd1234";
  // const auth = {"mac":mac,"password":password};
  const handleMacChange = (event) => {
    setMac(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  useEffect(()=>{
    setSocket(io('http://139.59.92.20:5000'));
    // setSocket(io('http://localhost:5000'));
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
        var mini = order_component_mintime.substring(
          order_component_mintime.lastIndexOf("_") + 1,order_component_mintime.length );
        mini = parseInt(mini);
        setMintime(mini)
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
    // socket.on('disconnect',()=>{

    //   })
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
            setBreak('Start Break');
        }
        if (statusofmalfunctionbutton == true)
        {
            var timeClient = Math.floor(Date.now()*0.001)
            sendtoserver("em", timeClient);
            setStatusofmalfunctionbutton(false);
            setMal('Start Malfunction');
        }
        if (statusofstartbutton == false)
        {
            var timeClient = Math.floor(Date.now()*0.001)
            setTimestamp(timeClient);
            sendtoserver("st", timeClient);
            setStatusofstartbutton(true);
            setStart('End Task');
        }
        else
        {
            var timeClient = Math.floor(Date.now()*0.001)
            if (timeClient - timestamp >= mintime)
            {
                sendtoserver("et", timeClient);

                setStatusofstartbutton(true);
                setStart('Start Task');
            }
            else
            {
                console.log("Interval is less than mintime");
                alert("Interval is less than min_time");
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
               setStart('Start Task')
               if (statusofbreakbutton == false)
               {
                   sendtoserver("sb", timeClient);
                   setStatusofbreakbutton(true);
                   setBreak('End Break')
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
           setBreak('End Break')
       }
       else
       {
           console.log("Start a task to end your break");
           alert("Start a task to end your break")
       }
  }
  function startmal(e){
    if(statusofmalfunctionbutton == false)
     {
       var timeClient = Math.floor(Date.now()*0.001)
       sendtoserver("sm",timeClient);
       setStatusofmalfunctionbutton(true);
       setMal('End Malfunction')
     }
    //  socket.on('smresponse',function(output){
    //   console.log(output);
    // });
    // socket.on('user.logout.expired',function(output){
    //   console.log(output)
    // });
  }
  function disconnect(e){
    window.location.reload();
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
              <Row align="middle" style={{marginTop: "10px"}}>
                <Col xs={{span:0}} md={{span:6}} lg={{span:6}}></Col>
                <Col xs={{span:12}} md={{span:6}} lg={{span:6}}>
                <Button  styletype="primary" shape="round" size="large" style={{ backgroundColor: "black", border: "0", color: "white" }} type="submit" disabled={disable} onClick={connect}>
                  Connect
                </Button>
                </Col>
                <Col xs={{span:12}} md={{span:6}} lg={{span:6}}>
                <Button styletype="primary" shape="round" size="large" style={{ backgroundColor: "black", border: "0", color: "white" }} onClick={disconnect}>
                  Disconnect
                </Button>
                </Col>
                <Col xs={{span:0}} md={{span:6}} lg={{span:6}}></Col>
              </Row>
              {/* <Divider type="horizontal" />   */}
              <Row style={{marginTop:"30px"}}>
                <Col style={{marginTop:"10px"}} xs={{span:24}} md={{span:8}} lg={{span:8}}>
                <Button type="flex" styletype="primary" shape="round" htmlType="submit"  size="large" onClick={starttask} style={{backgroundColor:'green'}}>
                {valueofstart}
                </Button>
                </Col>
                <Col  xs={{span:0}} md={{span:0}} lg={{span:0}}></Col>
                <Col style={{marginTop:"10px"}} xs={{span:24}} md={{span:8}} lg={{span:8}}>
                <Button type="flex" styletype="primary" shape="round" htmlType="submit"  size="large" onClick={startbreak} style={{backgroundColor:'yellow'}}>
                {valueofbreak}
                </Button>
                </Col>
                <Col xs={{span:0}} md={{span:0}} lg={{span:0}}></Col>
                <Col style={{marginTop:"10px"}} xs={{span:24}} md={{span:8}} lg={{span:8}}>
                <Button type="flex" styletype="primary" shape="round" htmlType="submit"  size="large" onClick={startmal} style={{backgroundColor:'red'}}>
                {valueofmal}
                </Button>
                </Col>
              </Row>
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
