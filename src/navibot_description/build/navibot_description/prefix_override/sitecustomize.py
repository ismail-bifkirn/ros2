import sys
if sys.prefix == '/usr':
    sys.real_prefix = sys.prefix
    sys.prefix = sys.exec_prefix = '/home/ismail/ros2_ws/src/navibot_description/install/navibot_description'
