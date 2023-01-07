---
title: Streaming Systems
date: 2019-07-24 10:25:00 Z
categories:
- Distributed System
tags:
- Books
- Distributed System
mathjax: true
---

I recently read through the book _Streaming Systems_ so think it would be a good
idea to write up a summary/thoughts about it. The book is recommended by
[评:Streaming System(简直炸裂,强势安利)](https://zhuanlan.zhihu.com/p/43301661) on
zhihu.

## Layout of the book

The book consists of 10 chapters. The book starts of by stating that traditionally
batching systems, streaming systems, databases are three distinct concepts.
Batching systems are systems that process finite amount of data (bounded data)
producing accurate (strong consistent) (exactly-once) results which typically have
higher throughput and higher latency. Streaming systems deal with unbounded data
and are typically not as accurate (consistent) as batching systems, which could be
implemented by repeated batching. Databases are just persistent data storage that
one can do CRUD operations and queries on. The first half of the book summarizes various
techniques that modern streaming systems use to achieve certain goals like dealing
with out-of-order updates based on event time and end-to-end exactly-once processing.
The argument the author wants to make for the first half of the book is that,
given the recent improvements of various streaming systems, strong consistency can be
achieve in streaming systems (examples are MillWheel, Spark Streaming, and Flink).
As a result, streaming systems can have parity with batch.

In the second half of the book, the author presents a view or way of thinking, where
streaming systems and databases are just two sides of a coin, where they are just
processors of two different forms of data, called _"Theory of Stream and Table Relativity"_,
and show that how those different techniques used in streaming systems like trigger,
watermark, and windowing play a role in the new unified world. The author also talks
about how to extend the current SQL syntax to support the new unified theory (which
unfortunately I personally am not interested in so I just skimmed through that part).

I think the core of this book, or I personally find the most value out of this book,
is the point of view that tables (databases) and streams are basically talking about
the same thing. This is a conclusion the author draws after many years of working in
distributed systems and examining different techniques used by modern streaming
systems, this post will talk in the reverse order of the book, such that the theory
will first be presented and explained, and after that various techniques will be
presented to see how they fit into the big picture. I won't be going into details
of how those techniques work though.

<!--more-->

## Theory of Stream and Table Relativity

Suppose there isn't any streams or tables, there is just data, and processors of data.
A processor is just a function that takes a dataset, do some calculation to it, and
output a dataset. For some operations, we need to take a look at every single data
in the dataset (like sum, average, and count), while for other a partial view of the
dataset or even a view of a single data is enough (like filter, and +1). We can then
think of streams are just "flowing" data over time, while a table is just a view of
the data at one specific point of time, i.e. static data. So data is either static
or dynamic, and we need transformations/operations of the two. The specific techniques
described below is available in the book and there is also a nice example of how
MapReduce fits into the theory. This post is just a summary mainly comes from Chapter 6
of the book.

### stream → stream: Nongrouping (element-wise) operations

Applying nongrouping operations to a stream alters the data in the stream while
leaving them in motion, yielding a new stream with possibly different cardinality.

### stream → table: Grouping operations

Grouping data within a stream brings those data to rest, yielding a table that evolves over time.

- Windowing incorporates the dimension of event time into such groupings.

- Merging windows dynamically combine over time, allowing them to reshape themselves in
response to the data observed and dictating that key remain the unit of
atomicity/parallelization, with window being a child component of grouping within that key.

### table → stream: Ungrouping (triggering) operations

Triggering data within a table ungroups them into motion, yielding a stream that
captures a view of the table’s evolution over time.

- Watermarks provide a notion of input completeness relative to event time, which is
a useful reference point when triggering event-timestamped data, particularly data
grouped into event-time windows from unbounded streams.

- The accumulation mode for the trigger determines the nature of the stream,
dictating whether it contains deltas or values, and whether retractions for previous
deltas/values are provided.

### table → table: (none)

There are no operations that consume a table and yield a table, because it’s not
possible for data to go from rest and back to rest without being put into motion.
As a result, all modifications to a table are via conversion to a stream and back again.

## Thoughts

TBH I don't really have the same strong feeling as the author of the recommendation
in [评:Streaming System(简直炸裂,强势安利)](https://zhuanlan.zhihu.com/p/43301661).
I think the main reason is that I don't have much experience working on those
"traditional" systems as the author does and to me this new kind of way to think about
modern distributed system doesn't "change" the way I think about these systems - it's
"just" a way to think about them. It doesn't mean that the book and the view it presents
isn't great; it is wonderful in a way that it provides a way to view things in a higher
dimension and when we take a close look a specific problem, we'll have a good understanding
of how it plays a role in the bigger picture, which is think is the most value of this book.
In short, it's a wonderful book that presents a complete new way of thinking about
distributed systems based on years of experience of dealing with big data in Google.
