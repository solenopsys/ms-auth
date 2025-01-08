// jwtService.ts

import { config } from "dotenv";
import jwt, { type  SignOptions,type VerifyOptions } from "jsonwebtoken";

// Загрузка переменных окружения из .env файла
config();

interface TokenPayload {
   userId: number;
   permissions: string[];   
  
  // Добавьте другие поля по необходимости
}

class JwtService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || "default-secret";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  }

  /**
   * Создаёт JWT токен с заданными полезными данными.
   * @param payload Полезные данные для включения в токен.
   * @returns Подписанный JWT токен.
   */
  public createToken(payload: TokenPayload): string {
    const signOptions: SignOptions = {
      expiresIn: this.expiresIn,
      algorithm: "HS256",
    };
    return jwt.sign(payload, this.secretKey, signOptions);
  }

  /**
   * Проверяет валидность JWT токена и возвращает его полезные данные.
   * @param token JWT токен для проверки.
   * @returns Полезные данные из токена или null, если токен не валиден.
   */
  public verifyToken(token: string): TokenPayload | null {
    const verifyOptions: VerifyOptions = {
      algorithms: ["HS256"],
    };
    try {
      const decoded = jwt.verify(token, this.secretKey, verifyOptions);
      return decoded as TokenPayload;
    } catch (error) {
      console.error("Ошибка проверки токена:", error);
      return null;
    }
  }
}

 
export { JwtService, type TokenPayload };
