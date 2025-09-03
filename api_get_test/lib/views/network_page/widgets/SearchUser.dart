// ignore_for_file: override_on_non_overriding_member

import 'package:api_get_test/networks/api_service_state.dart';
import 'package:api_get_test/networks/network_data_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SearchUser extends StatefulWidget {
  @override
  State<SearchUser> createState() => _SearchUser();
}

class _SearchUser extends State<SearchUser> {
  final _usernameController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<ApiService, NetworkDataState>(
      builder: (context, apiService, networkDataState, child) {
        return Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "GitHub 用户查询",
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _usernameController,
                        decoration: InputDecoration(
                          labelText: "请输入GitHub用户名",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person),
                          hintText: "例如:mac003",
                        ),
                      ),
                    ),
                    SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: apiService.isLoading
                          ? null
                          : () async {
                              if (_usernameController.text.isNotEmpty) {
                                debugPrint(
                                  '开始查询用户：${_usernameController.text}',
                                );
                                final userInfo = await apiService.fetchUserInfo(
                                  _usernameController.text.trim(),
                                );
                                debugPrint('查询结果：$userInfo');
                                if (userInfo != null) {
                                  networkDataState.setUserInfo(userInfo);
                                } else {
                                  if (true) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text("用户不存在或网络错误"),
                                        backgroundColor: Colors.orange,
                                      ),
                                    );
                                  }
                                }
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text("请输入查询内容"),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                                return;
                              }
                            },

                      child: apiService.isLoading
                          ? SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text("查询"),
                    ),
                  ],
                ),
                if (apiService.error != null)
                  Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: Colors.red,
                            size: 16,
                          ),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              apiService.error!,
                              style: TextStyle(color: Colors.red.shade700),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              apiService.clearError();
                            },
                            child: Text("关闭"),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
