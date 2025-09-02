import 'package:flutter/material.dart';
import '../../../providers/word_generator_state.dart';
import 'package:provider/provider.dart';
class ListIsNotEmpty extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();

  return  Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "历史记录(${wordState.history.length}",
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              TextButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Text("确认清空"),
                      content: Text("确定清空所有历史记录吗？"),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: Text("取消"),
                        ),
                        TextButton(
                          onPressed: () {
                            wordState.clearHistory();
                            Navigator.pop(context);
                          },
                          child: Text("清空"),
                        ),
                      ],
                    ),
                  );
                },
                child: Text("清空历史记录"),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: wordState.history.length,
            itemBuilder: (context, index) {
              final pair = wordState.history.reversed.toList()[index];
              final isFavorite = wordState.isFavorite(pair);

              return Card(
                margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ListTile(
                  leading: CircleAvatar(child: Text('${index + 1}')),
                  title: Text(pair.asLowerCase, style: TextStyle(fontSize: 18)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: isFavorite ? Colors.red : null,
                        ),
                        onPressed: () {
                          wordState.toggleFavorite(pair);
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}