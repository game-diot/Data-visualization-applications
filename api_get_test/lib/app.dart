import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'views/my_home_page/my_home_page.dart';
import 'providers/word_generator_state.dart';
import 'networks/network_data_state.dart';
import 'networks/api_service_state.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => WordGeneratorState()),
        ChangeNotifierProvider(create: (context) => ApiService()),
        ChangeNotifierProvider(create: (context) => NetworkDataState()),
      ],
      child: MaterialApp(
        title: 'demo',
        theme: ThemeData(useMaterial3: true),
        home: my_home_page(),
      ),
    );
  }
}
