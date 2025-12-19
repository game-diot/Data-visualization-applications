import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes

class AES128:
    """
    AES-128加密解密工具类
    支持CBC和ECB模式。
    注意：ECB模式因安全性问题，不推荐在实际应用中使用。
    """
    
    # AES-128密钥长度必须是16字节
    KEY_SIZE = 16
    BLOCK_SIZE = 16
    
    def __init__(self, key=None):
        """
        初始化AES-128
        :param key: 16字节的密钥，如果为None则自动生成
        """
        if key is None:
            self.key = get_random_bytes(self.KEY_SIZE)
        else:
            if len(key) != self.KEY_SIZE:
                raise ValueError(f"AES-128密钥长度必须为{self.KEY_SIZE}字节")
            self.key = key
    
    def encrypt_ecb(self, plaintext):
        """
        ECB模式加密
        :param plaintext: 明文字符串或字节
        :return: base64编码的密文字符串
        """
        if isinstance(plaintext, str):
            plaintext = plaintext.encode('utf-8')
        
        # 创建AES cipher对象
        cipher = AES.new(self.key, AES.MODE_ECB)
        
        # 对数据进行填充并加密
        padded_data = pad(plaintext, self.BLOCK_SIZE)
        ciphertext = cipher.encrypt(padded_data)
        
        # 返回base64编码的密文
        return base64.b64encode(ciphertext).decode('utf-8')
    
    def decrypt_ecb(self, ciphertext):
        """
        ECB模式解密
        :param ciphertext: base64编码的密文字符串
        :return: 解密后的明文字符串
        """
        try:
            # 解码base64密文
            ciphertext_bytes = base64.b64decode(ciphertext)
            
            # 创建AES cipher对象
            cipher = AES.new(self.key, AES.MODE_ECB)
            
            # 解密并去除填充
            decrypted_data = cipher.decrypt(ciphertext_bytes)
            plaintext = unpad(decrypted_data, self.BLOCK_SIZE)
            
            return plaintext.decode('utf-8')
        except (ValueError, TypeError) as e:
            raise ValueError("ECB模式解密失败，可能是密文或密钥不正确。") from e
    
    def encrypt_cbc(self, plaintext, iv=None):
        """
        CBC模式加密
        :param plaintext: 明文字符串或字节
        :param iv: 初始化向量，16字节，如果为None则自动生成
        :return: 包含密文和IV的字典
        """
        if isinstance(plaintext, str):
            plaintext = plaintext.encode('utf-8')
        
        # 生成或验证IV
        if iv is None:
            iv = get_random_bytes(self.BLOCK_SIZE)
        elif len(iv) != self.BLOCK_SIZE:
            raise ValueError(f"IV长度必须为{self.BLOCK_SIZE}字节")
        
        # 创建AES cipher对象
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        
        # 对数据进行填充并加密
        padded_data = pad(plaintext, self.BLOCK_SIZE)
        ciphertext = cipher.encrypt(padded_data)
        
        return {
            'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
            'iv': base64.b64encode(iv).decode('utf-8')
        }
    
    def decrypt_cbc(self, ciphertext, iv):
        """
        CBC模式解密
        :param ciphertext: base64编码的密文字符串
        :param iv: base64编码的初始化向量字符串
        :return: 解密后的明文字符串
        """
        try:
            # 解码base64密文和IV
            ciphertext_bytes = base64.b64decode(ciphertext)
            iv_bytes = base64.b64decode(iv)
            
            if len(iv_bytes) != self.BLOCK_SIZE:
                raise ValueError(f"IV长度必须为{self.BLOCK_SIZE}字节")
            
            # 创建AES cipher对象
            cipher = AES.new(self.key, AES.MODE_CBC, iv_bytes)
            
            # 解密并去除填充
            decrypted_data = cipher.decrypt(ciphertext_bytes)
            plaintext = unpad(decrypted_data, self.BLOCK_SIZE)
            
            return plaintext.decode('utf-8')
        except (ValueError, TypeError) as e:
            raise ValueError("CBC模式解密失败，可能是密文、IV或密钥不正确。") from e
    
    def get_key(self):
        """获取当前密钥（base64编码）"""
        return base64.b64encode(self.key).decode('utf-8')
    
    def set_key(self, key_b64):
        """设置密钥（base64编码）"""
        try:
            key_bytes = base64.b64decode(key_b64)
            if len(key_bytes) != self.KEY_SIZE:
                raise ValueError(f"AES-128密钥长度必须为{self.KEY_SIZE}字节")
            self.key = key_bytes
        except base64.binascii.Error as e:
            raise ValueError("密钥不是有效的base64编码。") from e

def demo():
    """演示AES-128加密解密的使用"""
    print("=== AES-128 加密解密演示 ===\n")
    
    # 创建AES-128实例
    aes = AES128()
    
    # 原始数据
    plaintext = "Hello, AES-128! 这是中文测试。"
    print(f"原始文本: {plaintext}")
    print(f"自动生成的密钥(base64): {aes.get_key()}\n")
    
    # ECB模式演示
    print("-" * 30)
    print("1. ECB模式演示 (不推荐用于生产环境):")
    try:
        ecb_cipher = aes.encrypt_ecb(plaintext)
        print(f"加密结果: {ecb_cipher}")
        ecb_decrypted = aes.decrypt_ecb(ecb_cipher)
        print(f"解密结果: {ecb_decrypted}")
        print(f"ECB模式验证: {'成功' if plaintext == ecb_decrypted else '失败'}")
    except Exception as e:
        print(f"ECB模式演示失败: {e}")
    print()
    
    # CBC模式演示
    print("-" * 30)
    print("2. CBC模式演示 (推荐):")
    try:
        cbc_result = aes.encrypt_cbc(plaintext)
        print(f"加密结果 (ciphertext): {cbc_result['ciphertext']}")
        print(f"生成的IV (base64): {cbc_result['iv']}")
        cbc_decrypted = aes.decrypt_cbc(cbc_result['ciphertext'], cbc_result['iv'])
        print(f"解密结果: {cbc_decrypted}")
        print(f"CBC模式验证: {'成功' if plaintext == cbc_decrypted else '失败'}")
    except Exception as e:
        print(f"CBC模式演示失败: {e}")
    print()
    
    # 使用固定密钥的演示
    print("-" * 30)
    print("3. 固定密钥演示:")
    try:
        # 修正：使用一个正好16字节的密钥
        fixed_key = b'This_is_16byte'  # 长度为16字节
        print(f"使用的固定密钥 (bytes): {fixed_key}")
        print(f"固定密钥 (base64): {base64.b64encode(fixed_key).decode('utf-8')}")
        
        fixed_aes = AES128(fixed_key)
        
        test_text = "使用固定密钥测试"
        print(f"测试文本: {test_text}")
        
        encrypted = fixed_aes.encrypt_ecb(test_text)
        print(f"ECB加密结果: {encrypted}")
        
        decrypted = fixed_aes.decrypt_ecb(encrypted)
        print(f"ECB解密结果: {decrypted}")
        
        print(f"固定密钥演示验证: {'成功' if test_text == decrypted else '失败'}")
    except ValueError as e:
        print(f"固定密钥演示失败: {e}")
    print("-" * 30)

if __name__ == "__main__":
    demo()