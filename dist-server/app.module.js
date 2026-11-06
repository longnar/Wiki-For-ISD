"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const path = __importStar(require("path"));
const user_entity_1 = require("./entities/user.entity");
const character_entity_1 = require("./entities/character.entity");
const character_move_entity_1 = require("./entities/character-move.entity");
const character_base_stat_entity_1 = require("./entities/character-base-stat.entity");
const glossary_entity_1 = require("./entities/glossary.entity");
const security_audit_log_entity_1 = require("./entities/security-audit-log.entity");
const news_entity_1 = require("./entities/news.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const character_module_1 = require("./modules/character/character.module");
const glossary_module_1 = require("./modules/glossary/glossary.module");
const security_module_1 = require("./modules/security/security.module");
const news_module_1 = require("./modules/news/news.module");
const storage_module_1 = require("./modules/storage/storage.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const useSsl = configService.get('DB_SSL') === 'true';
                    return {
                        type: 'mysql',
                        host: configService.get('DB_HOST') || '127.0.0.1',
                        port: Number(configService.get('DB_PORT') || 3306),
                        username: configService.get('DB_USER') || 'root',
                        password: configService.get('DB_PASSWORD') || '',
                        database: configService.get('DB_NAME') || 'idol_showdown_wiki',
                        entities: [user_entity_1.User, character_entity_1.Character, character_move_entity_1.CharacterMove, character_base_stat_entity_1.CharacterBaseStat, glossary_entity_1.Glossary, security_audit_log_entity_1.SecurityAuditLog, news_entity_1.News],
                        synchronize: false,
                        logging: false,
                        ssl: useSsl
                            ? {
                                rejectUnauthorized: false,
                            }
                            : false,
                        extra: {
                            connectionLimit: 10,
                            enableKeepAlive: true,
                            keepAliveInitialDelay: 10000,
                        },
                    };
                },
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.join(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.join(process.cwd(), 'dist'),
                exclude: ['/api/(.*)', '/health/(.*)'],
            }),
            storage_module_1.StorageModule,
            auth_module_1.AuthModule,
            character_module_1.CharacterModule,
            glossary_module_1.GlossaryModule,
            security_module_1.SecurityModule,
            news_module_1.NewsModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map