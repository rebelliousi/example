type Pagination<T> = {
    count: number;
    current_page: number;
    total_pages: number;
    next: null | string;
    previous: null | string;
    results: T;
};

export default Pagination;
