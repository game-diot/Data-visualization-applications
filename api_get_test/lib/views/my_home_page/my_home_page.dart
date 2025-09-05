import 'package:api_get_test/views/aaaNetwork_page/testnetwrok_page.dart';
import 'package:flutter/material.dart';

import '../favorites_page/favorites_page.dart';
import '../generator_page/generator_page.dart';
import '../network_page/network_page.dart';
import '../history_page/history_page.dart';
import '../my_widget_page/my_widget_page.dart';
import 'widgets/SideBar.dart';
import '../text_page/test.dart';
import '../login_page/login.dart';
import '../card_scroll_page/card_scroll_page.dart';
//根页面，Row布局，左侧为safe area固定侧边栏，右侧为expanded铺满的page页面，页面通过selectedIndex选择，这个是自带的状态管理statefulWidget
class my_home_page extends StatefulWidget {
  @override
  State<my_home_page> createState() => _my_home_page();
}

class _my_home_page extends State<my_home_page> {
  int selectedIndex = 0;
  Widget getPage() {
    switch (selectedIndex) {
      case 0:
        return generator_page();
      case 1:
        return favorites_page();
      case 2:
        return network_page();
      case 3:
        return history_page();
      case 4:
        return my_widget_page();
      case 5:
        return TestPage();
      case 6:
      return LoginPage();
      case 7:
      return testnetwork_page();
      case 8:
      return card_scroll_page();
      default:
        return Center(child: Text("选中的$selectedIndex页面无内容"));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          Container(
            width: 150,
            child: SideBar(
              selectedIndex: selectedIndex,
              onSelected: (index) {
                setState(() {
                  selectedIndex = index;
                });
              },
            ),
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
   
                border: Border.all(color: Colors.grey.shade100, width: 2),
              ),
              child: getPage(),
            ),
          ),
        ],
      ),
    );
  }
}
