var IP_TURTLEBOT = '192.168.0.1';
var SOCKET_ROS = 'ws://'+IP_TURTLEBOT+':9090';
var SOCKET_STREAM = 'ws://'+IP_TURTLEBOT+':8084/';

var ACCEL_MAX_LIN = 3.0;
var ACCEL_MAX_ANG = 10.0;
var SPEED_MAX_LIN = 1.5;
var SPEED_MAX_ANG = 3.0;

var ROS_POLL_PERIOD = 0.05;//period in seconds







var ros = null;
var sender = null;
var joystick = null;
var stickradius = 0;
var ros_velocity = null;
var velocity_lin = 0.0;
var velocity_ang = 0.0;

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













//===================================================================================
// ROS functions

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


function rosUpdateVelocity(){
	var twist = new ROSLIB.Message({
		linear : {
			x : velocity_lin,
			y : 0.0,
			z : 0.0
		},
		angular : {
			x : 0.0,
			y : 0.0,
			z : velocity_ang
		}
	});
	ros_velocity.publish(twist);
	
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
	if(sender){
		clearInterval(sender);
		sender = null;
	}
	
	sender = setInterval(function(){		
		velocity_lin = stepToward(
			velocity_lin, 
			ACCEL_MAX_LIN*ROS_POLL_PERIOD, 
			(-joystick.deltaY()/stickradius) * SPEED_MAX_LIN
		);
		velocity_ang = stepToward(
			velocity_ang, 
			ACCEL_MAX_ANG*ROS_POLL_PERIOD,
			(-joystick.deltaX()/stickradius) * SPEED_MAX_ANG
		);
		
		rosUpdateVelocity();
	}, 1000*ROS_POLL_PERIOD);
};

function joyEnd(){
	if(sender){
		clearInterval(sender);
		sender = null;
	}
	
	sender = setInterval(function(){		
		velocity_lin = stepToward(
			velocity_lin,
			ACCEL_MAX_LIN*ROS_POLL_PERIOD,
			0
		);
		velocity_ang = stepToward(
			velocity_ang,
			ACCEL_MAX_ANG*ROS_POLL_PERIOD,
			0
		);

		rosUpdateVelocity();
		
		if(velocity_lin==0 && velocity_ang==0){
			clearInterval(sender);
			sender = null;
		}
	}, 1000*ROS_POLL_PERIOD);
	
};


//===================================================================================
// Utility functions

function stepToward(value, step, destination){
	
	var distance = destination - value;
	
	if(Math.abs(distance)>step){
		var distanceSign = distance>=0? 1 : -1;
		return value + distanceSign * step;
	}
	else{
		return destination;
	}
	
	
}