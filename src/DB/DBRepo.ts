import { Model, ProjectionType, QueryFilter, QueryOptions, Types } from "mongoose";



export abstract class DBRebo<T> {
 
    constructor(protected model: Model<T>) { }

    find = async (
        {
            filter = {},
            options = {},
            projection = {}

        }: {
            options?: QueryOptions,
            filter?: QueryFilter<T>,
            projection?: ProjectionType<T>

        }
    ) => {
        const docs = await this.model.find(filter, projection, options)
        return docs
    }
    findOne = async (
        {
            filter = {},
            options = {},
            projection = {}

        }: {
            options?: QueryOptions,
            filter?: QueryFilter<T>,
            projection?: ProjectionType<T>

        }
    ) => {
        const doc = await this.model.findOne(filter, projection, options)
        return doc
    }
    findById = async (
        {
            id,
            options = {},
            projection = {}

        }: {
            id?: Types.ObjectId | string,
            projection?: ProjectionType<T>,
            options?: QueryOptions

        }
    ) => {
        const doc = await this.model.findById(id, projection, options)
        return doc
    }
    create = async ({
        doc
    }: {
        doc: Partial<T>
    }) => {
        const createdDoc = await this.model.create(doc);
        return createdDoc
    }
    findByIdAndUpdate = async (
        id: string,
        updateData: Partial<T>,
        options: QueryOptions = { returnDocument: 'after' }
    ) => {
        const doc = await this.model.findByIdAndUpdate(id, updateData, options);
        return doc;
    }
    deleteOne = async ({
        filter = {},
        options = {},

    }: {
        options?: any,
        filter?: QueryFilter<T>,

    }) => {
        const doc = await this.model.deleteOne(filter, options);
        return doc;
    }
    updateOne = async ({
        filter,
        update,
        options
    }: {
        filter: Record<string, any>;
        update: Record<string, any>;
        options?: any;
    }): Promise<any> => {
  
        return await this.model.updateOne(filter, update, options);
    };



}