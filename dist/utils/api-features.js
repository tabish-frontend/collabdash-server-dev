"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIFeatures = void 0;
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = Object.assign({}, this.queryString);
        const excludedFields = ["page", "limit", "sort", "fields"];
        excludedFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }
    search() {
        if (this.queryString.search) {
            const searchBy = {};
            searchBy.$or = [
                { first_name: { $regex: new RegExp(this.queryString.search, "i") } },
                { last_name: { $regex: new RegExp(this.queryString.search, "i") } },
                { full_name: { $regex: new RegExp(this.queryString.search, "i") } },
                { email: { $regex: new RegExp(this.queryString.search, "i") } },
                { mobile_1: { $regex: new RegExp(this.queryString.search, "i") } },
                {
                    name_on_invoice: { $regex: new RegExp(this.queryString.search, "i") },
                },
                { title: { $regex: new RegExp(this.queryString.search, "i") } }, // search field for "Feedbacks"
            ];
            this.query = this.query.find(searchBy);
        }
        return this;
    }
    paginate() {
        let page = parseInt(this.queryString.page, 10) || 1;
        let limit = parseInt(this.queryString.limit, 10) || 20;
        // Validate page and limit to ensure they are non-negative numbers
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = 20;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        }
        else {
            this.query = this.query.select("-__v");
        }
        return this;
    }
}
exports.APIFeatures = APIFeatures;
//# sourceMappingURL=api-features.js.map