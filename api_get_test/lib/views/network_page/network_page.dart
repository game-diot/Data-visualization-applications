import 'package:flutter/material.dart';
import '../../networks/api_service_state.dart';
import '../../networks/network_data_state.dart';
import '../../providers/word_generator_state.dart';
import 'package:provider/provider.dart';

//网络功能相关页面
class network_page extends StatefulWidget {
  @override
  State<network_page> createState() => _network_page_state();
}

class _network_page_state extends State<network_page> {
  final _usernameController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer3<ApiService, NetworkDataState, WordGeneratorState>(
      builder: (context, apiService, networkState, wordState, child) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "网络功能演示",
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                SizedBox(height: 20),

                // 网络连接测试
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "网络连接测试",
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        SizedBox(height: 10),
                        ElevatedButton.icon(
                          onPressed: apiService.isLoading
                              ? null
                              : () async {
                                  final isConnected = await apiService
                                      .testConnection();
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          isConnected ? '网络连接正常' : '网络连接失败',
                                        ),
                                        backgroundColor: isConnected
                                            ? Colors.green
                                            : Colors.red,
                                      ),
                                    );
                                  }
                                },
                          icon: Icon(Icons.wifi),
                          label: Text('测试网络连接'),
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 20),

                // GitHub用户查询
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
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
                                  labelText: '输入GitHub用户名',
                                  border: OutlineInputBorder(),
                                  prefixIcon: Icon(Icons.person),
                                  hintText: '例如: octocat',
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
                                          '开始查询用户: ${_usernameController.text}',
                                        );
                                        final userInfo = await apiService
                                            .fetchUserInfo(
                                              _usernameController.text.trim(),
                                            );
                                        debugPrint('查询结果: $userInfo');

                                        if (userInfo != null) {
                                          networkState.setUserInfo(userInfo);
                                        } else {
                                          // 显示错误信息
                                          if (mounted) {
                                            ScaffoldMessenger.of(
                                              context,
                                            ).showSnackBar(
                                              SnackBar(
                                                content: Text('用户不存在或网络错误'),
                                                backgroundColor: Colors.orange,
                                              ),
                                            );
                                          }
                                        }
                                      }
                                    },
                              child: apiService.isLoading
                                  ? SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : Text("查询"),
                            ),
                          ],
                        ),

                        // 显示错误信息
                        if (apiService.error != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
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
                                      style: TextStyle(
                                        color: Colors.red.shade700,
                                      ),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () => apiService.clearError(),
                                    child: Text('关闭'),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 20),

                // 显示用户信息
                if (networkState.userInfo != null &&
                    networkState.userInfo!.isNotEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "用户信息",
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              IconButton(
                                onPressed: () {
                                  networkState.clearData();
                                  _usernameController.clear();
                                },
                                icon: Icon(Icons.clear),
                                tooltip: '清除数据',
                              ),
                            ],
                          ),
                          SizedBox(height: 10),

                          // 头像
                          if (networkState.userInfo!['avatar_url'] != null)
                            Center(
                              child: CircleAvatar(
                                radius: 40,
                                backgroundImage: NetworkImage(
                                  networkState.userInfo!['avatar_url'],
                                ),
                                onBackgroundImageError:
                                    (exception, stackTrace) {
                                      debugPrint('头像加载失败: $exception');
                                    },
                                child:
                                    networkState.userInfo!['avatar_url'] == null
                                    ? Icon(Icons.person, size: 40)
                                    : null,
                              ),
                            ),

                          SizedBox(height: 16),

                          // 用户信息
                          _buildInfoRow(
                            context,
                            '用户名',
                            networkState.userInfo!['login'],
                          ),
                          _buildInfoRow(
                            context,
                            '姓名',
                            networkState.userInfo!['name'],
                          ),
                          _buildInfoRow(
                            context,
                            '公开仓库',
                            '${networkState.userInfo!['public_repos'] ?? 0}',
                          ),
                          _buildInfoRow(
                            context,
                            '关注者',
                            '${networkState.userInfo!['followers'] ?? 0}',
                          ),
                          _buildInfoRow(
                            context,
                            '关注中',
                            '${networkState.userInfo!['following'] ?? 0}',
                          ),

                          if (networkState.userInfo!['bio'] != null &&
                              networkState.userInfo!['bio']
                                  .toString()
                                  .isNotEmpty)
                            _buildInfoRow(
                              context,
                              '简介',
                              networkState.userInfo!['bio'],
                            ),

                          if (networkState.userInfo!['location'] != null &&
                              networkState.userInfo!['location']
                                  .toString()
                                  .isNotEmpty)
                            _buildInfoRow(
                              context,
                              '位置',
                              networkState.userInfo!['location'],
                            ),
                        ],
                      ),
                    ),
                  ),

                SizedBox(height: 20),

                // 获取示例数据
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "示例数据获取",
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        SizedBox(height: 10),
                        Row(
                          children: [
                            ElevatedButton.icon(
                              onPressed: apiService.isLoading
                                  ? null
                                  : () async {
                                      debugPrint('开始获取示例数据...');
                                      final quotes = await apiService
                                          .fetchRandomQuotes();
                                      debugPrint('获取到数据: ${quotes.length} 条');
                                      networkState.setQuotes(quotes);
                                    },
                              icon: Icon(Icons.cloud_download),
                              label: Text('获取示例数据'),
                            ),
                            SizedBox(width: 10),
                            TextButton.icon(
                              onPressed: () {
                                // 直接使用离线数据

                                networkState.setQuotes(
                                  apiService.getOfflineQuotes(),
                                );
                                apiService.clearError();
                              },
                              icon: Icon(Icons.offline_pin),
                              label: Text('使用离线数据'),
                            ),
                            TextButton.icon(
                              onPressed: () {
                                final randomQuote = apiService.targetQuote();
                                if (randomQuote != null) {
                                  // 只显示一条，不清空缓存
                                  networkState.setQuotes([randomQuote]);
                                }
                              },
                              icon: Icon(Icons.shuffle),
                              label: Text('随机来一条'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 20),

                // 显示获取的数据
                if (networkState.quotes.isNotEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '数据列表 (${networkState.quotes.length}条)',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              IconButton(
                                onPressed: () {
                                  networkState.setQuotes([]);
                                },
                                icon: Icon(Icons.clear_all),
                                tooltip: '清空列表',
                              ),
                            ],
                          ),
                          SizedBox(height: 10),

                          ...networkState.quotes.map(
                            (quote) => Card(
                              margin: EdgeInsets.only(bottom: 8),
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '"${quote['content']}"',
                                      style: Theme.of(
                                        context,
                                      ).textTheme.bodyLarge,
                                    ),
                                    SizedBox(height: 8),
                                    Text(
                                      '- ${quote['id']}',
                                      style: Theme.of(
                                        context,
                                      ).textTheme.bodySmall,
                                    ),
                                    Text(
                                      '- ${quote['body']}',
                                      style: Theme.of(
                                        context,
                                      ).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                            ),
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

  Widget _buildInfoRow(BuildContext context, String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(
              value?.toString() ?? 'N/A',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}
