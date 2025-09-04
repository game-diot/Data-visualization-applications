import 'package:flutter/material.dart';

class SideBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  const SideBar({
    Key? key,
    required this.selectedIndex,
    required this.onSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: NavigationRail(
        extended: MediaQuery.of(context).size.width >= 670,
        selectedIndex: selectedIndex,
        onDestinationSelected: onSelected,
        destinations: [
          NavigationRailDestination(
            icon: Icon(Icons.home),
            selectedIcon: Icon(Icons.home_filled),
            label: Text("生成器"),
          ),
          NavigationRailDestination(
            icon: Icon(Icons.favorite),
            selectedIcon: Icon(Icons.favorite_border),
            label: Text("收藏"),
          ),
          NavigationRailDestination(
            icon: Icon(Icons.cloud),
            selectedIcon: Icon(Icons.cloud_circle),
            label: Text("网络"),
          ),
          NavigationRailDestination(
            icon: Icon(Icons.history),
            selectedIcon: Icon(Icons.history_edu),
            label: Text("历史"),
          ),
          NavigationRailDestination(
            icon: Icon(Icons.book),
            selectedIcon: Icon(Icons.book_online),
            label: Text("组件"),
          ),
          NavigationRailDestination(
            icon: Icon(Icons.abc_outlined),
            selectedIcon: Icon(Icons.abc_rounded),
            label: Text("test"),
          ),
        ],
      ),
    );
  }
}
