#include <unistd.h>
#include <algorithm>
#include <string>

#include <ros/ros.h>
#include <std_msgs/String.h>

using namespace std;

string replaceAll(string str, const string& from, const string& to) {
    size_t start_pos = 0;
    while((start_pos = str.find(from, start_pos)) != string::npos) {
        str.replace(start_pos, from.length(), to);
        start_pos += to.length(); // Handles case where 'to' is a substring of 'from'
    }
    return str;
}

void rcv(const std_msgs::String::ConstPtr& msg)
{
  string msgstr = replaceAll(replaceAll(msg->data, "\\", "\\\\"), "\"", "\\\"");
  
  ROS_INFO(("Say: \""+msgstr+"\"").c_str());
  system(("scripts/speak.sh \""+msgstr+"\"").c_str());
}

int main(int argc, char **argv)
{
  ROS_INFO("Starting speak node");
  ros::init(argc, argv, "speak");

  ros::NodeHandle n;

  ros::Subscriber sub = n.subscribe("speak_topic", 1000, rcv);
  ros::spin();

  return 0;
}



