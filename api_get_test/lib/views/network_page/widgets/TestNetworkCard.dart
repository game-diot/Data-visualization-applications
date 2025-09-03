import 'package:flutter/material.dart';
import '../../../networks/api_service_state.dart';
import 'package:provider/provider.dart';

class TestNetWork extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<ApiService>(
      builder: (context, apiService, child) {
        return Card(
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("网络连接测试", style: Theme.of(context).textTheme.titleLarge),
                SizedBox(height: 10),
                ElevatedButton.icon(
                  icon: Icon(Icons.wifi),
                  label: Text("测试网络连接"),
                  onPressed: apiService.isLoading
                      ? null
                      : () async {
                          final isConnected = await apiService.testConnection();
                          if (true) {
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
                          ;
                        },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
