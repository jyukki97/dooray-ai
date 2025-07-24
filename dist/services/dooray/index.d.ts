/**
 * Dooray 서비스 모듈
 */
export * from './types';
export { DoorayClient } from './client';
import { DoorayClient } from './client';
import { DoorayApiOptions } from './types';
/**
 * Dooray 클라이언트 팩토리
 */
export declare class DoorayClientFactory {
    private static instance;
    /**
     * Dooray 클라이언트 생성
     */
    static createClient(options?: DoorayApiOptions): Promise<DoorayClient>;
    /**
     * 기존 클라이언트 인스턴스 반환 또는 새로 생성
     */
    static getInstance(options?: DoorayApiOptions): Promise<DoorayClient>;
    /**
     * 클라이언트 인스턴스 재설정
     */
    static resetInstance(): void;
    /**
     * Dooray 연결 상태 확인
     */
    static validateConnection(): Promise<boolean>;
}
/**
 * 기본 Dooray 클라이언트 인스턴스 가져오기
 */
export declare function getDoorayClient(): Promise<DoorayClient>;
/**
 * Dooray 연결 상태 확인
 */
export declare function validateDoorayConnection(): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map