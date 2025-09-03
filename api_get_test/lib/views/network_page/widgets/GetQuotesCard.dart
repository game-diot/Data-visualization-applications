import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import '../../../networks/api_service_state.dart';
import '../../../networks/network_data_state.dart';

class GetQuotesCard extends StatelessWidget {
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
                Text("示例数据获取", style: Theme.of(context).textTheme.titleLarge),
                SizedBox(height: 10),
                Row(
                  children: [
                    ElevatedButton.icon(
                      onPressed: apiService.isLoading
                          ? null
                          : () async {
                              debugPrint('开始获取示例数据');
                              final quotes = await apiService
                                  .fetchRandomQuotes();
                              debugPrint("获取到数据：${quotes.length}");
                              networkDataState.setQuotes(quotes);
                            },
                      icon: Icon(Icons.cloud_download),
                      label: Text("获取示例数据"),
                    ),
                    SizedBox(width: 10),
                    TextButton.icon(
                      onPressed: () {
                        networkDataState.setQuotes(
                          apiService.getOfflineQuotes(),
                        );
                        apiService.clearError();
                      },
                      icon: Icon(Icons.offline_pin),
                      label: Text("使用离线数据"),
                    ),
                    SizedBox(width: 10),
                    TextButton.icon(
                      onPressed: () {
                        final randomQuote = apiService.targetQuote();
                        if (randomQuote != null) {
                          networkDataState.setQuotes([randomQuote]);
                        }
                      },
                      icon: Icon(Icons.shuffle),
                      label: Text("随机来一条"),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
