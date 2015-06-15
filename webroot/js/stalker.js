var IP_TURTLEBOT = '192.168.0.1';
var SOCKET_ROS = 'ws://'+IP_TURTLEBOT+':9090';
var SOCKET_STREAM = 'ws://'+IP_TURTLEBOT+':8084/';







var ros = null;
var sender = null;
var joystick = null;
var stickradius = 0;
var ros_velocity = null;

$(document).ready(function() {
	rosConnect();

	joySetup();

	//Start Video streaming
	var player = new jsmpeg(
		new WebSocket(SOCKET_STREAM), 
		{canvas:document.getElementById('stream')}
	);
});
window.addEventListener("resize", joySetup);














function rosConnect(){

	ros = new ROSLIB.Ros({
		url : SOCKET_ROS
	});

	ros.on('connection', function() {
		console.log('Connected to websocket server.');
		var elmt = document.getElementById('status');
		elmt.className = "connected";
		elmt.innerHTML = "Connected";
	});

	ros.on('error', function(error) {
		console.log('Error connecting to websocket server: ', error);
		var elmt = document.getElementById('status');
		elmt.className = "error";
		elmt.innerHTML = "Error: "+error;
	});

	ros.on('close', function() {
		console.log('Connection to websocket server closed.');
		var elmt = document.getElementById('status');
		elmt.className = "error";
		elmt.innerHTML = "Connection refused/closed";
	});

	//Connect to a topic
	ros_velocity = new ROSLIB.Topic({
		ros : ros,
		name : '/mobile_base/commands/velocity',
		messageType : 'geometry_msgs/Twist'
	});
}

//===================================================================================
// Joystick functions

function joySetup(){
	joyEnd();
	stickradius = Math.min($(document).width(), $(document).height())/2.5;

	if(joystick){
		joystick.destroy();
	}
	
	stick.style += "z-index: 1000;"
	joystick = new VirtualJoystick({
		container: document.getElementById('stick'),
		mouseSupport: true,
		limitStickTravel: true,
		stickRadius: stickradius,
		strokeStyle: 'black'
	});

	joystick._container.addEventListener('touchstart', joyStart);
	joystick._container.addEventListener('mousedown', joyStart);
	joystick._container.addEventListener('touchEnd', joyEnd);
	joystick._container.addEventListener('mouseup', joyEnd);
}

function joyStart(){
	sender = setInterval(function(){
		var ampli = Math.sqrt(
			 joystick.deltaX()*joystick.deltaX()
			+joystick.deltaY()*joystick.deltaY());

		var linspeed = -joystick.deltaY()/(2*stickradius);
		var angspeed = -joystick.deltaX()/(stickradius/2);
		var twist = new ROSLIB.Message({
			linear : {
				x : linspeed,
				y : 0.0,
				z : 0.0
			},
			angular : {
				x : 0.0,
				y : 0.0,
				z : angspeed
			}
		});
		ros_velocity.publish(twist);
	}, 100);
};

function joyEnd(){			
	if(sender){
		clearInterval(sender);
		sender = null;
	}
	var twist = new ROSLIB.Message({
		linear : {
			x : 0.0,
			y : 0.0,
			z : 0.0
		},
		angular : {
			x : 0.0,
			y : 0.0,
			z : 0.0
		}
	});
	ros_velocity.publish(twist);
};