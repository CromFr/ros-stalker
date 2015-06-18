#include <unistd.h>

#include <ros/ros.h>
#include <std_msgs/String.h>


void rcv(const std_msgs::String::ConstPtr& msg)
{
  ROS_INFO("exec: ", msg->data.c_str());
  system(msg->data.c_str());
}

int main(int argc, char **argv)
{
  ROS_INFO("Starting shell node");
  ros::init(argc, argv, "shell");

  ros::NodeHandle n;

  ros::Subscriber sub = n.subscribe("shell_topic", 1000, rcv);
  ros::spin();

  return 0;
}



