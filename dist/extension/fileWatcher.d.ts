/**
 * 파일 시스템 감시자
 */
export declare class FileWatcher {
    private watchers;
    private isWatching;
    /**
     * 파일 감시 시작
     */
    startWatching(): void;
    /**
     * 파일 생성 처리
     */
    private handleFileCreate;
    /**
     * 파일 변경 처리
     */
    private handleFileChange;
    /**
     * 파일 삭제 처리
     */
    private handleFileDelete;
    /**
     * 설정 파일 변경 처리
     */
    private handleConfigChange;
    /**
     * 파일 감시 정지
     */
    stopWatching(): void;
    /**
     * 감시 상태 확인
     */
    isFileWatching(): boolean;
}
//# sourceMappingURL=fileWatcher.d.ts.map