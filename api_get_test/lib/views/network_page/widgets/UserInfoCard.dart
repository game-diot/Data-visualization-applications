import 'package:flutter/material.dart';
import '../../../networks/network_data_state.dart';
import 'package:provider/provider.dart';
import 'InfoRow.dart';

class UserInfoCard extends StatefulWidget {
  @override
  State<UserInfoCard> createState() => _UserInfoCard();
}

class _UserInfoCard extends State<UserInfoCard> {
  final _usernameController = TextEditingController();
  @override
  Widget build(BuildContext context) {
    return Consumer<NetworkDataState>(
      builder: (context, networkDataState, child) {
        return Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("用户信息", style: Theme.of(context).textTheme.titleLarge),
                    IconButton(
                      onPressed: () {
                        networkDataState.clearData();
                        _usernameController.clear();
                      },
                      icon: Icon(Icons.clear),
                      tooltip: "清除信息",
                    ),
                  ],
                ),
                SizedBox(height: 10),
                if (networkDataState.userInfo!['avatar_url'] != null)
                  Center(
                    child: CircleAvatar(
                      radius: 40,
                      backgroundImage: NetworkImage(
                        networkDataState.userInfo!['avatar_url'],
                      ),
                      onBackgroundImageError: (exception, stackTrace) {
                        debugPrint("头像加载错误：$exception");
                      },
                      child: networkDataState.userInfo!['avatar_url'] == null
                          ? Icon(Icons.person, size: 40)
                          : null,
                    ),
                  ),
                SizedBox(height: 10),
                InfoRow(
                  label: "用户名",
                  value: networkDataState.userInfo!['login'],
                ),
                InfoRow(label: "姓名", value: networkDataState.userInfo!['name']),
                InfoRow(
                  label: "公开仓库",
                  value: networkDataState.userInfo!['public_repos'] ?? 0,
                ),
                InfoRow(
                  label: "粉丝",
                  value: networkDataState.userInfo!["folling"] ?? 0,
                ),
                if (networkDataState.userInfo!['bio'] != null && networkDataState.userInfo!['bio'].toString().isNotEmpty)
                  InfoRow(label:"简介",value:networkDataState.userInfo!['bio'],),
                if (networkDataState.userInfo!['location']!=null && networkDataState.userInfo!['location'].toString().isNotEmpty)
                  InfoRow(label: "位置",value:networkDataState.userInfo!['location'],),
              ],
            ),
          ),
        );
      },
    );
  }
}
