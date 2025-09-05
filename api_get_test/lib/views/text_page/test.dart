import "package:flutter/material.dart";
import '../../testProvider/testModel.dart';
import '../../testProvider/testProvider.dart';
import 'package:provider/provider.dart';

class TestPage extends StatefulWidget {
  @override
  State<TestPage> createState() => _TestPage();
}

class _TestPage extends State<TestPage> {
  bool _CheckBoxValue = false;

  String _cardSelectedColorValue = "inherit global";

  final List<String> _cardSelectedItems = [
    "red",
    "green",
    "yellow",
    "blue",
    "inherit global",
  ];
  @override
  Widget build(BuildContext context) {
    final projectTheme = context.watch<ProjectThemeProvider>();
    final widgetThemeProvider = context.watch<WidgetThemeProvider>();
    final widgetTheme = widgetThemeProvider.getCurrentTheme(projectTheme.mode);
    //最外层页面
    return Scaffold(
      backgroundColor: widgetTheme.background,
      body: SingleChildScrollView(
        
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            //header部分
            Row(
              children: [
               
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(color: widgetTheme.background),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        //header标题
                        Container(
                          padding: EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Text(
                                " 🎨 Multi-Theme Demo",
                                style: Theme.of(context).textTheme.headlineLarge
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        //header dropdownbutton
                        Container(
                          child: Row(
                            children: [
                              Container(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      "COLOR MODE",
                                      style: TextStyle(
                                        color: widgetTheme.text,
                                        fontSize: 12,
                                      ),
                                    ),
                                    DropdownButton<ProjectThemeMode>(
                                      value: projectTheme.mode,
                                      items: ProjectThemeMode.values.map((
                                        mode,
                                      ) {
                                        return DropdownMenuItem(
                                          value: mode,
                                          child: Text(
                                            mode == ProjectThemeMode.light
                                                ? "Light"
                                                : "dark",
                                            style: TextStyle(
                                              color: widgetTheme.text,
                                              fontSize: 12,
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                      onChanged: (value) {
                                        if (value != null) {
                                          context
                                              .read<ProjectThemeProvider>()
                                              .setThemeMode(value);
                                        }
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(width: 20),
                              Container(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      "GLOBAL THEME",
                                      style: TextStyle(
                                        color: widgetTheme.text,
                                        fontSize: 12,
                                      ),
                                    ),
                                    DropdownButton<WidgetThemeMode>(
                                      value: widgetThemeProvider.currentType,
                                      items: WidgetThemeMode.values.map((item) {
                                        return DropdownMenuItem(
                                          value: item,
                                          child: Text(
                                            item.name,
                                            style: TextStyle(
                                              color: widgetTheme.text,
                                              fontSize: 12,
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                      onChanged: (value) {
                                        if (value != null) {
                                          context
                                              .read<WidgetThemeProvider>()
                                              .setWidgetTheme(value);
                                        }
                                        ;
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 10),
            //内容card部分
            Container(
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  //card 001
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    decoration: BoxDecoration(
                      color: widgetTheme.background,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    width: 300,
                    height: 580,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Text("Section Theme:"),
                            SizedBox(width: 10),
                            DropdownButton(
                              value: _cardSelectedColorValue,
                              items: _cardSelectedItems.map((String item) {
                                return DropdownMenuItem(
                                  child: Text(item),
                                  value: item,
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _cardSelectedColorValue = newValue!;
                                });
                              },
                            ),
                          ],
                        ),
                        SizedBox(height: 10),
                        Container(
                          child: Text(
                            "Welcome",
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ),

                        SizedBox(height: 10),
                        Container(
                          child: Text(
                            "Welcome to the aisgduias kashgdiuadh ikashkdhs iaskhud ikah. kashdikashdi",
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: widgetTheme.primary,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 24,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "context header",
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 10),
                                Container(
                                  child: Column(
                                    children: [
                                      Text(
                                        "✨ OKLCH color space for perceptual uniformity",
                                      ),
                                      Text(
                                        "✨ OKLCH color space for perceptual uniformity",
                                      ),
                                      Text(
                                        "✨ OKLCH color space for perceptual uniformity",
                                      ),
                                      Text(
                                        "✨ OKLCH color space for perceptual uniformity",
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  //card 002
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    decoration: BoxDecoration(
                      color: widgetTheme.background,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    width: 300,
                    height: 580,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Text("Section Theme:"),
                            SizedBox(width: 10),
                            DropdownButton(
                              value: _cardSelectedColorValue,
                              items: _cardSelectedItems.map((String item) {
                                return DropdownMenuItem(
                                  child: Text(item),
                                  value: item,
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _cardSelectedColorValue = newValue!;
                                });
                              },
                            ),
                          ],
                        ),

                        Container(
                          child: Text(
                            "Welcome",
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ),

                        SizedBox(height: 10),
                        Container(
                          child: Text(
                            "Welcome to the aisgduias kashgdiuadh ikashkdhs iaskhud ikah. kashdikashdi",
                          ),
                        ),
                        Container(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Full Name",
                                style: Theme.of(context).textTheme.bodyLarge
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              TextField(
                                decoration: InputDecoration(
                                  hintText: "Enter your name",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                              SizedBox(height: 10),
                              Text(
                                "Email",
                                style: Theme.of(context).textTheme.bodyLarge
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              TextField(
                                decoration: InputDecoration(
                                  hintText: "your@email.com",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                              SizedBox(height: 10),
                              Text(
                                "Message",
                                style: Theme.of(context).textTheme.bodyLarge
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              TextField(
                                minLines: 3,
                                maxLines: 5,
                                decoration: InputDecoration(
                                  hintText: "Tell something to me...",
                                  border: OutlineInputBorder(),
                                  // contentPadding: EdgeInsets.symmetric(horizontal: 16,vertical: 24)
                                ),
                              ),
                              SizedBox(height: 10),
                              Row(
                                children: [
                                  Checkbox(
                                    value: _CheckBoxValue,
                                    onChanged: (value) {
                                      setState(() {
                                        _CheckBoxValue = !_CheckBoxValue;
                                      });
                                    },
                                  ),
                                  Text("Subscribe to our newsletter"),
                                ],
                              ),
                              SizedBox(height: 10),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: [
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: widgetTheme.primary,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    onPressed: () {},
                                    child: Text(
                                      "Submit",
                                      style: TextStyle(color: widgetTheme.text),
                                    ),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: widgetTheme.primary,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    onPressed: () {},
                                    child: Text(
                                      "Reset",
                                      style: TextStyle(color: widgetTheme.text),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  //card 003
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    decoration: BoxDecoration(
                      color: widgetTheme.background,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    width: 300,
                    height: 580,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Text("Section Theme:"),
                            SizedBox(width: 10),
                            DropdownButton(
                              value: _cardSelectedColorValue,
                              items: _cardSelectedItems.map((String item) {
                                return DropdownMenuItem(
                                  child: Text(item),
                                  value: item,
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _cardSelectedColorValue = newValue!;
                                });
                              },
                            ),
                          ],
                        ),

                        Container(
                          child: Text(
                            "Welcome",
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ),

                        SizedBox(height: 10),
                        Container(
                          child: Text(
                            "Welcome to the aisgduias kashgdiuadh ikashkdhs iaskhud ikah. kashdikashdi",
                          ),
                        ),
                        Container(
                          child: Padding(
                            padding: EdgeInsetsGeometry.all(16),
                            child: Wrap(
                              spacing: 16,
                              runSpacing: 16,
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    color: widgetTheme.primary,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  width: 110,
                                  height: 80,
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: 0,
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text(
                                          "2.4K",
                                          style: Theme.of(context)
                                              .textTheme
                                              .headlineMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                        Text("ACTIVE USERS"),
                                      ],
                                    ),
                                  ),
                                ),

                                Container(
                                  decoration: BoxDecoration(
                                    color: widgetTheme.primary,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  width: 110,
                                  height: 80,
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: 0,
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text(
                                          "87%",
                                          style: Theme.of(context)
                                              .textTheme
                                              .headlineMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                        Text("SATISFACTION"),
                                      ],
                                    ),
                                  ),
                                ),

                                Container(
                                  decoration: BoxDecoration(
                                    color: widgetTheme.primary,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  width: 110,
                                  height: 80,
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: 0,
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text(
                                          "12.5S",
                                          style: Theme.of(context)
                                              .textTheme
                                              .headlineMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: widgetTheme.text,
                                              ),
                                        ),
                                        Text("AVG.SESSION"),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Container(
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color.fromRGBO(
                                    0,
                                    100,
                                    142,
                                    1,
                                  ),

                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                onPressed: () {},
                                child: Text(
                                  "Primary",
                                  style: TextStyle(color: widgetTheme.text),
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () {},
                                child: Text(
                                  "Secondary",
                                  style: TextStyle(color: widgetTheme.text),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color.fromRGBO(
                                    61,
                                    60,
                                    134,
                                    1,
                                  ),

                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () {},
                                child: Text(
                                  "Accent",
                                  style: TextStyle(color: widgetTheme.text),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color.fromRGBO(
                                    178,
                                    31,
                                    65,
                                    1,
                                  ),

                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () {},
                                child: Text(
                                  "Neutral",
                                  style: TextStyle(color: widgetTheme.text),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color.fromRGBO(
                                    235,
                                    235,
                                    235,
                                    1,
                                  ),

                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  //card 004
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    decoration: BoxDecoration(
                      color: widgetTheme.background,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    width: 300,
                    height: 580,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Text("Section Theme:"),
                            SizedBox(width: 10),
                            DropdownButton(
                              value: _cardSelectedColorValue,
                              items: _cardSelectedItems.map((String item) {
                                return DropdownMenuItem(
                                  child: Text(item),
                                  value: item,
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _cardSelectedColorValue = newValue!;
                                });
                              },
                            ),
                          ],
                        ),

                        Container(
                          child: Text(
                            "Welcome",
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ),

                        SizedBox(height: 10),
                        Container(
                          child: Text(
                            "Welcome to the aisgduias kashgdiuadh ikashkdhs iaskhud ikah. kashdikashdi",
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: widgetTheme.background,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              vertical: 16,
                              horizontal: 8,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Theme Master",
                                  style: Theme.of(context).textTheme.bodyLarge
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 10),
                                Text(
                                  "The ultimate tool for managing complex theming systems. Built with modern CSS custom properties and OKLCH color space.",
                                ),
                                SizedBox(height: 10),
                                Container(
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      Text(
                                        "\$29/month",
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium
                                            ?.copyWith(
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Container(
                                        decoration: BoxDecoration(
                                          color: widgetTheme.background,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        margin: EdgeInsets.all(2),
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 1,
                                          vertical: 1,
                                        ),
                                        child: ElevatedButton(
                                          onPressed: () {},
                                          child: Text(
                                            "Secondary",
                                            style: TextStyle(
                                              color: widgetTheme.text,
                                            ),
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Color.fromRGBO(
                                              61,
                                              60,
                                              134,
                                              1,
                                            ),

                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(height: 10),
                        Container(
                          decoration: BoxDecoration(
                            color: widgetTheme.background,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              vertical: 16,
                              horizontal: 8,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Theme Master",
                                  style: Theme.of(context).textTheme.bodyLarge
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 10),
                                Text(
                                  "The ultimate tool for managing complex theming systems. Built with modern CSS custom properties and OKLCH color space.",
                                ),
                                SizedBox(height: 10),
                                Container(
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      Text(
                                        "\$29/month",
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium
                                            ?.copyWith(
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Container(
                                        decoration: BoxDecoration(
                                          color: widgetTheme.background,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        margin: EdgeInsets.all(2),
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 1,
                                          vertical: 1,
                                        ),
                                        child: ElevatedButton(
                                          onPressed: () {},
                                          child: Text(
                                            "Secondary",
                                            style: TextStyle(
                                              color: widgetTheme.text,
                                            ),
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Color.fromRGBO(
                                              61,
                                              60,
                                              134,
                                              1,
                                            ),

                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
