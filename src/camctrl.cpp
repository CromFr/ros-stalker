#include <stdio.h> 
#include <stdlib.h> 
#include <stdint.h>   
#include <string.h>  
#include <unistd.h>

#include <algorithm>
#include <string>

#include <ros/ros.h>
#include <std_msgs/String.h>

extern "C" {
	FILE* file;

	void Send(unsigned char id, unsigned char value){
		static int i = 0;
	
		char data[] = {id,value};
		fwrite(data, 1, 2, file);
		fflush(file);
		//printf("Sent %d (%d, %d)\n", i++, data[0], data[1]);
	}
	
	int Init(char* tty){
		file = fopen(tty,"w");
		if(!file)return 1;
	}

	void Deinit(){
		if(file!=0)
			fclose(file);
	}
}


using namespace std;

void rcv(const std_msgs::String::ConstPtr& msg)
{
	stringstream strstr(msg->data);

	float yaw, pitch;
	strstr >> yaw;
	strstr >> pitch;


	//yaw:
	// command: -170 -> +170
	// reality: ?
	
	//pitch:
	// command: -90 -> 90
	// reality: 0 -> 170
	pitch = ((pitch+90.0)/180.0)*170;

	//cout<<"Moving cam to: "<<yaw<<":"<<pitch<<endl;

	Send(0, (int)pitch);
	//Send(1, yaw);
	

}

int main(int argc, char **argv)
{
	ROS_INFO("Starting camctrl node");
	ros::init(argc, argv, "camctrl");

	ros::NodeHandle n;

	ros::Subscriber sub = n.subscribe("camctrl_topic", 1000, rcv);

	char port[] = "/dev/ttyACM0";
	ROS_INFO((string("Connecting Arduino on ")+port).c_str());
	Init(port);
	
	ros::spin();
	
	Deinit();
	return 0;
}




