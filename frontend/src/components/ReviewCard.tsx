import { Star } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{review.author}</span>
        </div>
        <span className="text-xs text-muted-foreground">{review.date}</span>
      </div>
      
      <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
