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

add_executable(main src/main.cpp)
target_link_libraries(main ${catkin_LIBRARIES})

add_executable(shell src/shell.cpp)
target_link_libraries(shell ${catkin_LIBRARIES})


#C++11
set(CMAKE_CXX_FLAGS "-std=c++0x ${CMAKE_CXX_FLAGS}")
