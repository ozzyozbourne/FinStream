package finstream.data.events;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Convert;

@Convert
public class EventPayloadConverter implements AttributeConverter<Payload.Event, String> {

    @Override
    public String convertToDatabaseColumn(Payload.Event attribute) {
        return "";
    }

    @Override
    public Payload.Event convertToEntityAttribute(String dbData) {
        return null;
    }
}
