import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';

import Column from './Column';
import '../css/index.css';

const DefaultCardContent = (props) => <div>{props.content}</div>;
export default class Kanban extends React.Component {
    state = this.props.data;

    static propTypes = {
        // DragDropContext container
        onDragStart: PropTypes.func,
        onDragUpdate: PropTypes.func,
        onDragEnd: PropTypes.func,
        onBeforeDragStart: PropTypes.func,
        className: PropTypes.string,
        data: PropTypes.object,
        columnContianerClass: PropTypes.string,

        columnSettings: PropTypes.shape({
            headingClassName: PropTypes.string,
            cardListClassName: PropTypes.string,
            columnClassName: PropTypes.string,
            onDragStyle: PropTypes.object,
            isDropDisabled: PropTypes.bool,
            isCombineEnabled: PropTypes.bool,
        }),

        cardSettings: PropTypes.shape({
            cardClassName: PropTypes.string,
            index: PropTypes.number.isRequired,
            onDragStyle: PropTypes.object,
            onClick: PropTypes.func,
            isDragDisabled: PropTypes.bool,
            disableInteractiveElementBlocking: PropTypes.bool,
            shouldRespectForcePress: PropTypes.bool,
        })
    };

    onDragStart = start => {

        if (this.props.onDragStart) {
            this.props.onDragStart();
        }
    }

    onDragUpdate = update => {

        if (this.props.odDragUpdat) {
            this.props.onDragUpdate();
        }
    }

    onDragEnd = result => {

        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];

        if (start === finish) {
            const newCardIds = Array.from(start.cardIds);
            newCardIds.splice(source.index, 1);
            newCardIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                cardIds: newCardIds,
            };

            const newState = {
                ...this.state,
                columns: {
                    ...this.state.columns,
                    [newColumn.id]: newColumn
                }
            };

            this.setState(newState);
            return;
        }

        const startCardIds = Array.from(start.cardIds);
        startCardIds.splice(source.index, 1);
        const newStart = {
            ...start,
            cardIds: startCardIds,
        }

        const finishCardIds = Array.from(finish.cardIds);
        finishCardIds.splice(destination.index, 0, draggableId);

        const newFinish = {
            ...finish,
            cardIds: finishCardIds,
        }

        const newState = {
            ...this.state,
            columns: {
                ...this.state.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        }

        this.setState(newState);


        if (this.props.onDragEnd) {
            this.props.onDragEnd();
        }

        return;
    }


    render() {
        return (
            <DragDropContext
                onDragStart={this.onDragStart}
                onDragUpdate={this.onDragUpdate}
                onDragEnd={this.onDragEnd}
                onBeforeDragStart={this.onBeforeDragStart}

                className={this.props.className}
            >
                <div className={`container__columns ${this.props.columnContianerClass}`}>
                    {this.state.columnOrder.map(columnId => {
                        const column = this.state.columns[columnId];

                        const cards = column.cardIds.map(cardId => {
                            return this.state.cards.find(card => card["id"] === cardId)
                        })

                        return <Column key={column.id} column={column} cards={cards} renderer={column.renderer || DefaultCardContent} />
                        /**
                         * @props   # key: to keep track of the columns created
                         *          # column: to pass column data
                         *          # cards: to pass the cards of the column
                         */
                    })}
                </div>
            </DragDropContext>
        )
    }
}