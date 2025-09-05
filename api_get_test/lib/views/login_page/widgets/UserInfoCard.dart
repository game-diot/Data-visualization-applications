import 'package:flutter/material.dart';
import '../network/models.dart';
import 'InfoRow.dart';

class UserInfoCard extends StatelessWidget {
  final User? user;

  const UserInfoCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    if (user == null) {
      // 如果 user 为 null，直接显示提示
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: Text("未登录或没有用户信息")),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("用户信息", style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 10),

            // 头像处理：为空时显示默认头像
            Center(
              child: CircleAvatar(
                radius: 40,
                backgroundImage:
                    (user!.image != null && user!.image!.isNotEmpty)
                    ? NetworkImage(user!.image!)
                    : null,
                child: (user!.image == null || user!.image!.isEmpty)
                    ? const Icon(Icons.person, size: 40)
                    : null,
              ),
            ),

            const SizedBox(height: 10),

            // 这里给默认值，避免 null 报错
            InfoRow(label: "用户名", value: user!.username ?? "未知"),
            InfoRow(label: "邮箱", value: user!.email ?? "未提供"),
            InfoRow(
              label: "姓名",
              value: "${user!.firstName ?? ""} ${user!.lastName ?? ""}",
            ),
            InfoRow(label: "性别", value: user!.gender ?? "未填写"),
            InfoRow(
              label: "Access Token",
              value: user!.accessToken?.substring(0, 20) ?? "无",
            ),
          ],
        ),
      ),
    );
  }
}
