import { Repository } from 'typeorm';
import { News } from '../../entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
export declare class NewsService {
    private readonly newsRepo;
    constructor(newsRepo: Repository<News>);
    getAllNews(): Promise<News[]>;
    getNewsById(id: number): Promise<News>;
    createNews(dto: CreateNewsDto): Promise<{
        message: string;
        patch: News;
    }>;
    updateNews(id: number, dto: Partial<CreateNewsDto>): Promise<{
        message: string;
        patch: News;
    }>;
    deleteNews(id: number): Promise<{
        message: string;
    }>;
}
