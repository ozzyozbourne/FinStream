import React, { useState, useEffect, useRef } from 'react';
import { yahooService } from '../../../services/yahooService';
import { Stock } from '../../../types';
import SearchBar from '../SearchBar';
import Button from '../Button';
import './StockSearch.css';

interface StockSearchProps {
    onSelect: (stock: Stock) => void;
    placeholder?: string;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSelect, placeholder = "Search for stocks..." }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSearchQuery('');
                setSearchResults([]);
            }
        };

        if (searchQuery) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            setIsSearching(true);

            try {
                // Use debouncing in real app, but for now direct call
                const searchResults = await yahooService.searchStocks(query);
                setSearchResults(searchResults);
            } catch (err) {
                console.error('Error searching stocks:', err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectStock = (stock: Stock) => {
        onSelect(stock);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="stock-search-container" ref={searchContainerRef}>
            <SearchBar
                placeholder={placeholder}
                onSearch={handleSearch}
                className="stock-search-input"
            />

            {searchQuery && (
                <div className="search-dropdown">
                    {isSearching ? (
                        <div className="search-loading">
                            <div className="loading-spinner"></div>
                            <span>Searching...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="search-results">
                            <div className="results-header">
                                <span className="results-count">{searchResults.length} results found</span>
                            </div>
                            <div className="results-list">
                                {searchResults.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        className="search-result-item"
                                        onClick={() => handleSelectStock(stock)}
                                    >
                                        <div className="result-info">
                                            <div className="result-header">
                                                <span className="result-symbol">{stock.symbol}</span>
                                                <span className="result-name">{stock.name}</span>
                                            </div>
                                            <div className="result-details">
                                                <span className="result-exch">{stock.exch}</span>
                                                <span className="result-type">{stock.type}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={(e?: React.MouseEvent) => {
                                                e?.stopPropagation();
                                                handleSelectStock(stock);
                                            }}
                                            className="add-button"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-results">
                            <div className="no-results-icon">🔍</div>
                            <span>No stocks found matching "{searchQuery}"</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockSearch;
