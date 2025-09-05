import 'package:api_get_test/networks/Auth/provides/GetUserProvider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../networks/Auth/provides/LoginProvider.dart';

class testnetwork_page extends StatefulWidget {
  State<testnetwork_page> createState() => _testnetwork_page();
}

class _testnetwork_page extends State<testnetwork_page> {
  @override
  Widget build(BuildContext context) {
    final loginProvider = context.watch<LoginProvider>();
    final getUserProvider = context.watch<GetUserProvider>();
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,

        children: [
          ElevatedButton(
            onPressed: () {
              loginProvider.login("emilys", "emilyspass");
            },
            child: Container(child: Text("登录")),
          ),
          Card(
            child: Column(
              children: [
                if (loginProvider.user != null)
                  Container(
                    child: Column(
                      children: [
                        Text(loginProvider.user!.id.toString()),
                        Text(loginProvider.user!.username.toString()),
                        Text(loginProvider.user!.firstName.toString()),
                        Text(loginProvider.user!.lastName.toString()),
                        Text(loginProvider.user!.email.toString()),
                        Text(loginProvider.user!.accessToken.toString()),
                        Text(loginProvider.user!.gender.toString()),
                      ],
                    ),
                  )
                else
                  Text("user为空，请获取"),
              ],
            ),
          ),
          SizedBox(height: 10,),
          ElevatedButton(
            onPressed: () {
              getUserProvider.getUser(loginProvider.user!.accessToken);
           
            },
            child: Container(child: Text("当前用户")),
          ),
          Card(
            child: Column(
              children: [
                getUserProvider.user != null
                    ? Container(
                        child: Column(
                          children: [
                            Text(getUserProvider.user!.id.toString()),
                            Text(getUserProvider.user!.username.toString()),
                            Text(getUserProvider.user!.firstName.toString()),
                            Text(getUserProvider.user!.lastName.toString()),
                            Text(getUserProvider.user!.email.toString()),
                            Text(getUserProvider.user!.role.toString()),
                            Text(getUserProvider.user!.gender.toString()),
                          ],
                        ),
                      )
                    : Text("user为空，请获取"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
