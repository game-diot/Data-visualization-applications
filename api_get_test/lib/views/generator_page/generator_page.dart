import 'package:flutter/material.dart';
import '../../providers/word_generator_state.dart';
import 'package:provider/provider.dart';
import 'widgets/BigCard.dart';
import 'widgets/Buttons.dart';
// 生成器页面部分，首先是单词生成器涉及到的状态管理，使用provider，

class generator_page extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();
    var pair = wordState.current;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          BigCard(pair: pair),
          SizedBox(height: 20),
          Buttons(),
          SizedBox(height: 10),
          Text(
            "总收藏数:${wordState.favorites.length}",
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
