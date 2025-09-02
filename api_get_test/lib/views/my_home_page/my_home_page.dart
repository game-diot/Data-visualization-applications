import 'package:flutter/material.dart';

import '../favorites_page/favorites_page.dart';
import '../generator_page/generator_page.dart';
import '../network_page/network_page.dart';
import '../history_page/history_page.dart';
import '../my_widget_page/my_widget_page.dart'; 

//根页面，Row布局，左侧为safe area固定侧边栏，右侧为expanded铺满的page页面，页面通过selectedIndex选择，这个是自带的状态管理statefulWidget
class my_home_page extends StatefulWidget {
  @override
  State<my_home_page> createState() => _my_home_page_state();
}

class _my_home_page_state extends State<my_home_page> {
  var selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    Widget page;
    switch (selectedIndex) {
      case 0:
        page = generator_page();
        break;
      case 1:
        page = favorites_page();
        break;
      case 2:
        page = network_page();
        break;
      case 3:
        page = history_page();
        break;
        case 4:
        page = my_widget_page();
        break;
      default:
        throw UnimplementedError("No Page for $selectedIndex");
    }
    return LayoutBuilder(
      builder: (context, constraints) {
        return Scaffold(
          body: Row(
            children: [
              SafeArea(
                child: NavigationRail(
                  extended: constraints.maxWidth >= 600,
                  destinations: [
                    NavigationRailDestination(
                      icon: Icon(Icons.home),
                      label: Text("生成器"),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.favorite),
                      label: Text("收藏"),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.cloud),
                      label: Text("网络"),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.history),
                      label: Text("历史"),
                    ),
                    NavigationRailDestination(
                      icon:Icon(Icons.book),
                      label: Text("组件"),
                    ),  
                  ],
                  selectedIndex: selectedIndex,
                  onDestinationSelected: (value) {
                    setState(() {
                      selectedIndex = value;
                    });
                  },
                ),
              ),
              Expanded(
                child: Container(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  child: page,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}