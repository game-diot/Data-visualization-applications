import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../networks/api_service_state.dart';
import '../../../networks/network_data_state.dart';

class QuotesShow extends StatelessWidget {
  @override
  Widget build(BuildContext contex) {
    return Consumer2<ApiService, NetworkDataState>(
      builder: (context, apiService, networkDataState, child) {
        return Card(
          child: Padding(
            padding: EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "数据列表(${networkDataState.quotes.length}条)",
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    IconButton(
                      icon: Icon(Icons.clear_all),
                      tooltip: "清空列表",
                      onPressed: () {
                        networkDataState.setQuotes([]);
                      },
                    ),
                  ],
                ),
                SizedBox(height: 10),
                ...networkDataState.quotes.map(
                  (quote) => Card(
                    margin: EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '"${quote['content']}"',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          SizedBox(height: 8),
                          Text(
                            '- $quote["id]',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          SizedBox(height: 8),
                          Text(
                            '"${quote['body']}"',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
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
