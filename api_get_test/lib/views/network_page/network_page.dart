import 'package:api_get_test/views/network_page/widgets/UserInfoCard.dart';
import 'package:flutter/material.dart';
import '../../networks/api_service_state.dart';
import '../../networks/network_data_state.dart';
import '../../providers/word_generator_state.dart';
import 'package:provider/provider.dart';
import 'widgets/TestNetworkCard.dart';
import 'widgets/QuotesShow.dart';
import 'widgets/SearchUser.dart';
import 'widgets/GetQuotesCard.dart';


class network_page extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer3<ApiService, NetworkDataState, WordGeneratorState>(
      builder: (context, apiService, networkState, wordState, child) {
        return Container(
          color: Theme.of(context).colorScheme.tertiaryContainer,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 网络连接测试
                  TestNetWork(),

                  SizedBox(height: 20),

                  // GitHub用户查询
                  SearchUser(),

                  SizedBox(height: 20),

                  // 显示用户信息
                  if (networkState.userInfo != null &&
                      networkState.userInfo!.isNotEmpty)
                    UserInfoCard(),

                  SizedBox(height: 20),

                  // 获取示例数据
                  GetQuotesCard(),

                  SizedBox(height: 20),

                  // 显示获取的数据
                  if (networkState.quotes.isNotEmpty) QuotesShow(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
