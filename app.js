

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: process.env.PORT || 4000 })


var chatters=[];

wss.on('connection', ws => 
{
  
  console.log('new connection: ',ws._socket.remoteAddress);
  ws.on('message', message => 
  {
    var data=null;
    console.log("Received message =>", message," ip: ",ws._socket.remoteAddress);
    try
    {
      data=JSON.parse(message);
      decide(data,ws);
    }
    catch (e)
    {
      console.log(e);
    }
    //ws.send(filter(message));
  })
  
})


function decide(data,ws)
{
  if(data.connected!=null)
  {
    var i;
    for(i=0;i<chatters.length;i++)
    {
      if(chatters[i][0]===ws)
      {
        chatters[i]=[ws,data];
        ws.send(JSON.stringify({replay:{date:Date.now()}}));
        break;
      }
    }
    if(i===chatters.length)
    {
      console.log(chatters.length);
      chatters.push([ws,data]);
      send_all({joined:{...data.connected}});
    }
  }
  if(data.message!=null)
  {
    send_all(data);
  }
}
function send_all(data)
{
  message=JSON.stringify(data);
  for(var i=0;i<chatters.length;i++)
  {
    chatters[i][0].send(message);
  }
}



var checkConnections = setInterval(function()
{
  for(var i=0;i<chatters.length;i++)
  {
    //console.log(chatters[i][1].connected.date,"   ",Date.now());
    if(chatters[i][1].connected.date<Date.now()-5000)
    {
      var disconnected=chatters.splice(i,1);
      //console.log("left ",{disconnected:{...disconnected[0][1].connected}});
      send_all({disconnected:{...disconnected[0][1].connected}})
      break;
    }
  }
},1000);
