import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'dart:math' as math;

//API请求状态管理
class ApiService extends ChangeNotifier {
  final Dio _dio = Dio();
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> _quotesCache = []; // 缓存

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get quotesCache => _quotesCache; // 提供只读访问

  ApiService() {
    // 配置Dio
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);
    _dio.options.sendTimeout = const Duration(seconds: 10);

    // 添加拦截器用于调试
    _dio.interceptors.add(
      LogInterceptor(
        request: true,
        requestHeader: true,
        requestBody: true,
        responseHeader: true,
        responseBody: true,
        error: true,
        logPrint: (obj) {
          debugPrint('DIO LOG: $obj');
        },
      ),
    );

    // 错误拦截器
    _dio.interceptors.add(
      InterceptorsWrapper(
        onError: (error, handler) {
          debugPrint('DIO ERROR: ${error.message}');
          debugPrint('DIO ERROR TYPE: ${error.type}');
          debugPrint('DIO ERROR RESPONSE: ${error.response}');
          handler.next(error);
        },
      ),
    );
  }

  Future<Map<String, dynamic>?> fetchUserInfo(String username) async {
    try {
      _setLoading(true);
      _setError(null);

      debugPrint('开始请求GitHub用户信息: $username');

      final response = await _dio.get(
        'https://api.github.com/users/$username',
        options: Options(
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Flutter-App',
          },
        ),
      );

      debugPrint('GitHub API 响应状态码: ${response.statusCode}');

      if (response.statusCode == 200) {
        debugPrint('GitHub API 响应数据: ${response.data}');
        return Map<String, dynamic>.from(response.data);
      }
      return null;
    } on DioException catch (e) {
      String errorMessage;
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
          errorMessage = '连接超时，请检查网络连接';
          break;
        case DioExceptionType.receiveTimeout:
          errorMessage = '接收数据超时';
          break;
        case DioExceptionType.badResponse:
          errorMessage = '服务器响应错误: ${e.response?.statusCode}';
          break;
        case DioExceptionType.connectionError:
          errorMessage = '网络连接失败，请检查网络设置';
          break;
        default:
          errorMessage = '请求失败: ${e.message}';
      }
      debugPrint('GitHub API 错误: $errorMessage');
      _setError(errorMessage);
      return null;
    } catch (e) {
      debugPrint('未知错误: $e');
      _setError('未知错误: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  Future<List<Map<String, dynamic>>> fetchRandomQuotes() async {
    try {
      _setLoading(true);
      _setError(null);

      debugPrint('开始请求示例数据...');

      // 修复：使用正确的JSONPlaceholder API
      final response = await _dio.get(
        'https://jsonplaceholder.typicode.com/posts',
        queryParameters: {'_limit': 100},
        options: Options(headers: {'Accept': 'application/json'}),
      );

      debugPrint('JSONPlaceholder API 响应状态码: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> posts = response.data;
        debugPrint('获取到 ${posts.length} 条数据');

        // 将posts转换为名言格式
        final quotes = posts
            .map(
              (post) => {
                'content': (post['title'] as String).length > 50
                    ? (post['title'] as String).substring(0, 50) + '...'
                    : post['title'] as String,
                'author': '用户 ${post['userId']}',
                'id': post['id'],
                'body': post['body'],
              },
            )
            .toList()
            .cast<Map<String, dynamic>>();
        _quotesCache = quotes; // 缓存起来
        return quotes;
      }

      return getOfflineQuotes();
    } on DioException catch (e) {
      String errorMessage;
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
          errorMessage = '连接超时，使用离线数据';
          break;
        case DioExceptionType.connectionError:
          errorMessage = '网络连接失败，使用离线数据';
          break;
        default:
          errorMessage = '请求失败，使用离线数据: ${e.message}';
      }
      debugPrint('获取数据失败: $errorMessage');
      _setError(errorMessage);
      return getOfflineQuotes();
    } catch (e) {
      debugPrint('未知错误: $e');
      _setError('未知错误，使用离线数据');
      return getOfflineQuotes();
    } finally {
      _setLoading(false);
    }
  }

  Map<String, dynamic>? targetQuote() {
    if (_quotesCache.isEmpty) {
      debugPrint('缓存为空，先调用 fetchRandomQuotes 获取数据');
      return null;
    }
    debugPrint('缓存有多少条${_quotesCache.length}');
    int value = math.Random().nextInt(_quotesCache.length);
    final targetQuote = _quotesCache[value];
    debugPrint('随机获取到数据: $targetQuote');
    return targetQuote;
  }

  // 离线备用数据
  List<Map<String, dynamic>> getOfflineQuotes() {
    return [
      {
        'content': '成功是99%的汗水加上1%的灵感',
        'author': '托马斯·爱迪生',
        'id': 1,
        "body": "谁知道呢？",
      },
      {
        'content': '生活就像骑自行车，要保持平衡就得不断前进',
        'author': '阿尔伯特·爱因斯坦',
        'id': 2,
        "body": "谁知道呢？",
      },
      {'content': '今天的努力，明天的辉煌', 'author': '励志格言', 'id': 3, "body": "谁知道呢？"},
      {'content': '不要等待机会，而要创造机会', 'author': '佚名', 'id': 4, "body": "谁知道呢？"},
      {'content': '相信自己，你比想象中更强大', 'author': '心灵鸡汤', 'id': 5, "body": "谁知道呢？"},
    ];
  }

  // 测试网络连接
  Future<bool> testConnection() async {
    try {
      _setLoading(true);
      _setError(null);

      final response = await _dio.get(
        'https://httpbin.org/get',
        options: Options(sendTimeout: const Duration(seconds: 5)),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('网络连接测试失败: $e');
      _setError('网络连接测试失败');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
