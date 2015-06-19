var IP_TURTLEBOT = '192.168.0.1';
var SOCKET_ROS = 'ws://'+IP_TURTLEBOT+':9090';
var SOCKET_STREAM = 'ws://'+IP_TURTLEBOT+':8084/';

var MOVE_ACCEL_LIN = 3.0;
var MOVE_ACCEL_ANG = 10.0;
var MOVE_SPEED_MAX_LIN = 0.9;
var MOVE_SPEED_MAX_ANG = 2.0;

var CAM_SPEED_YAW = 60;
var CAM_SPEED_PITCH = 90;
var CAM_POS_MIN_YAW = -170;
var CAM_POS_MAX_YAW = 170;
var CAM_POS_MIN_PITCH = -80;
var CAM_POS_MAX_PITCH = 90;


var ROS_POLL_PERIOD = 0.05;//period in seconds







var ros = null;
var ros_velocity = null;
var ros_speak = null;
var ros_camctrl = null;

var joyMove = null;
var joyMoveSender = null;
var joyMoveRadius = 0;

var joyCam = null;
var joyCamSender = null;
var joyCamRadius = 0;


var velocity_lin = 0.0;
var velocity_ang = 0.0;
var cam_yaw = 0.0;
var cam_pitch = 0.0;

$(document).ready(function() {
	rosConnect();

	joyMoveSetup();
	joyCamSetup();

	//Start Video streaming
	var player = new jsmpeg(
		new WebSocket(SOCKET_STREAM), 
		{canvas:document.getElementById('stream')}
	);
});
window.addEventListener("resize", joyMoveSetup);
window.addEventListener("resize", joyCamSetup);







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
	ros_camctrl = new ROSLIB.Topic({
		ros : ros,
		name : '/camctrl_topic',
		messageType : 'std_msgs/String'
	});
	ros_speak = new ROSLIB.Topic({
		ros : ros,
		name : '/speak_topic',
		messageType : 'std_msgs/String'
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
function rosUpdateCamPos(){
	var msg = new ROSLIB.Message({data: cam_yaw+" "+cam_pitch});
	ros_camctrl.publish(msg);
}

function speak(text){
	var msg = new ROSLIB.Message({data: text});
	ros_speak.publish(msg);
}

function onSpeakSubmit(){
	var text = document.getElementById('speak-bar-text').value;
	speak(text);
	return false;
}

//===================================================================================
// Move joystick functions

function joyMoveSetup(){
	joyMoveEnd();
	var container = document.getElementById('stick');
	joyMoveRadius = Math.min(container.offsetWidth, container.offsetHeight)/2.5;

	if(!joyMove){
		
		stick.style += "z-index: 1000;";//TODO
		joyMove = new VirtualJoystick({
			container: container,
			mouseSupport: true,
			limitStickTravel: true,
			joyMoveRadius: joyMoveRadius,
			strokeStyle: 'black'
		});
		joyMove._container.addEventListener('touchstart', joyMoveStart);
		joyMove._container.addEventListener('mousedown', joyMoveStart);
		joyMove._container.addEventListener('touchEnd', joyMoveEnd);
		joyMove._container.addEventListener('mouseup', joyMoveEnd);
	}
	joyMove._stickRadius = joyMoveRadius;
}

function joyMoveStart(){
	if(joyMoveSender){
		clearInterval(joyMoveSender);
		joyMoveSender = null;
	}
	
	joyMoveSender = setInterval(function(){		
		velocity_lin = stepToward(
			velocity_lin, 
			MOVE_ACCEL_LIN*ROS_POLL_PERIOD, 
			(-joyMove.deltaY()/joyMoveRadius) * MOVE_SPEED_MAX_LIN
		);
		velocity_ang = stepToward(
			velocity_ang, 
			MOVE_ACCEL_ANG*ROS_POLL_PERIOD,
			(-joyMove.deltaX()/joyMoveRadius) * MOVE_SPEED_MAX_ANG
		);
		
		rosUpdateVelocity();
	}, 1000*ROS_POLL_PERIOD);
};

function joyMoveEnd(){
	if(joyMoveSender){
		clearInterval(joyMoveSender);
		joyMoveSender = null;
	}
	
	joyMoveSender = setInterval(function(){		
		velocity_lin = stepToward(
			velocity_lin,
			MOVE_ACCEL_LIN*ROS_POLL_PERIOD,
			0
		);
		velocity_ang = stepToward(
			velocity_ang,
			MOVE_ACCEL_ANG*ROS_POLL_PERIOD,
			0
		);

		rosUpdateVelocity();
		
		if(velocity_lin==0 && velocity_ang==0){
			clearInterval(joyMoveSender);
			joyMoveSender = null;
		}
	}, 1000*ROS_POLL_PERIOD);
	
};

//===================================================================================
// Cam joystick functions

function joyCamSetup(){
	joyCamEnd();
	var container = document.getElementById('stickcam');
	joyCamRadius = Math.min(container.offsetWidth, container.offsetHeight)/2.5;

	
	if(!joyCam){
		stick.style += "z-index: 1000;";//TODO
		joyCam = new VirtualJoystick({
			container: container,
			mouseSupport: true,
			limitStickTravel: true,
			joyMoveRadius: joyCamRadius,
			strokeStyle: 'blue'
		});

		joyCam._container.addEventListener('touchstart', joyCamStart);
		joyCam._container.addEventListener('mousedown', joyCamStart);
		joyCam._container.addEventListener('touchEnd', joyCamEnd);
		joyCam._container.addEventListener('mouseup', joyCamEnd);
	}
	joyCam._stickRadius = joyCamRadius;
}

function joyCamStart(){
	if(joyCamSender){
		clearInterval(joyCamSender);
		joyCamSender = null;
	}
	
	joyCamSender = setInterval(function(){
		cam_pitch = stepToward(
			cam_pitch, 
			(-joyCam.deltaY()/joyCamRadius)*CAM_SPEED_PITCH*ROS_POLL_PERIOD, 
			-joyCam.deltaY() >=0? CAM_POS_MAX_PITCH : CAM_POS_MIN_PITCH
		);
		cam_yaw = stepToward(
			cam_yaw, 
			(-joyCam.deltaX()/joyCamRadius)*CAM_SPEED_YAW*ROS_POLL_PERIOD, 
			-joyCam.deltaX() >=0? CAM_POS_MAX_YAW : CAM_POS_MIN_YAW
		);
		
		rosUpdateCamPos();
	}, 1000*ROS_POLL_PERIOD);
};

function joyCamEnd(){
	if(joyCamSender){
		clearInterval(joyCamSender);
		joyCamSender = null;
	}
};


//===================================================================================
// Utility functions

function stepToward(value, step, destination){
	
	var distance = destination - value;
	step = Math.abs(step);
	
	if(Math.abs(distance)>step){
		var distanceSign = distance>=0? 1 : -1;
		return value + distanceSign * step;
	}
	else{
		return destination;
	}
	
	
}