declare namespace NodeJS {
    interface ProcessEnv {
        readonly GIT_COMMIT_SHA?: string;
        readonly GIT_COMMIT_AUTHOR?: string;
        readonly GIT_COMMIT_DATE?: string;
        readonly GIT_COMMIT_TITLE?: string;
    }
}
