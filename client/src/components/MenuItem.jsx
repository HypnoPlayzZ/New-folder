import React from 'react';
import styles from './MenuItem.module.css';
import formatINR from '../utils/currency';
import { Button } from 'react-bootstrap';

const MenuItem = ({ item, index, onAdd }) => {
    const hasHalf = item.price && typeof item.price.half === 'number';
    return (
        <div className={styles.container} style={{ animationDelay: `${index * 0.05}s` }}>
            <div className={styles.details}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.price}>
                    {hasHalf && <span>{formatINR(item.price.half)} (Half)</span>}
                    {hasHalf && item.price.full != null && '  /  '}
                    {item.price.full != null && <span>{formatINR(item.price.full)} (Full)</span>}
                </div>
                {item.description ? <div className={styles.description}>{item.description}</div> : null}
            </div>

            <div className={styles.imageWrap}>
                <div className={styles.imageContainer}>
                    <img src={item.imageUrl || 'https://placehold.co/300x300/ffecd2/212529?text=Steamy'} alt={item.name} className={styles.image} onError={(e)=>{e.target.onerror=null;e.target.src='https://placehold.co/300x300/ffecd2/212529?text=Steamy'}} />
                </div>
                <div className={styles.addContainer}>
                    <Button className={styles.addBtn} onClick={() => onAdd(item)}>Add</Button>
                </div>
            </div>
        </div>
    );
};

export default MenuItem;
