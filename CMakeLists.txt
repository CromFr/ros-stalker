cmake_minimum_required(VERSION 2.8.3)
project(stalker)

find_package(catkin REQUIRED COMPONENTS
  roscpp
  std_msgs
)

catkin_package(
#  INCLUDE_DIRS include
#  LIBRARIES stalker
#  CATKIN_DEPENDS rosbridge_suite roscpp std_msgs
#  DEPENDS system_lib
)

include_directories(
  ${catkin_INCLUDE_DIRS}
)

add_executable(shell src/shell.cpp)
target_link_libraries(shell ${catkin_LIBRARIES})

add_executable(speak src/speak.cpp)
target_link_libraries(speak ${catkin_LIBRARIES})

add_executable(camctrl src/camctrl.cpp)
target_link_libraries(camctrl ${catkin_LIBRARIES})


#C++11
set(CMAKE_CXX_FLAGS "-std=c++0x ${CMAKE_CXX_FLAGS}")
