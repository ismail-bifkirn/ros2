cmake_minimum_required(VERSION 3.8)
project(navibot_description)

find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)

# Install directories
install(DIRECTORY
  launch
  rviz
  meshes
  urdf
  worlds
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
